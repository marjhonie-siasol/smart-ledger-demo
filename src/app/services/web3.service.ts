import { Injectable, signal, computed, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { DEMO_TOKEN_ABI, DEMO_TOKEN_ADDRESS } from '../contracts/demo-token';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private provider!: ethers.BrowserProvider;
  private signer!: ethers.JsonRpcSigner;
  private contract!: ethers.Contract;

  // REACTIVE STATE (Signals)
  public currentAccount = signal<string>('');
  public ethBalance = signal<string>('0');
  public tokenBalance = signal<string>('0');
  public isConnected = computed(() => !!this.currentAccount());

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('[Web3Service] accountsChanged:', accounts);
      this.ngZone.run(async () => {
        if (accounts.length === 0) {
          this.currentAccount.set('');
          this.ethBalance.set('0');
          this.tokenBalance.set('0');
        } else {
          try {
            await this.connectWallet(); // Re-sync everything
          } catch (err) {
            console.error('[Web3Service] Error syncing on account change:', err);
          }
        }
      });
    });

    window.ethereum.on('chainChanged', () => {
      console.log('[Web3Service] chainChanged - reloading page');
      window.location.reload();
    });
  }

  async connectWallet(): Promise<string> {
    console.log('[Web3Service] connectWallet start');

    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();
    this.currentAccount.set(address);

    this.contract = new ethers.Contract(
      DEMO_TOKEN_ADDRESS,
      DEMO_TOKEN_ABI,
      this.signer
    );

    await this.refreshBalances();
    console.log('[Web3Service] Wallet connected and synced:', address);

    return address;
  }

  async refreshBalances(): Promise<void> {
    if (!this.provider || !this.currentAccount()) {
      console.warn('[Web3Service] Cannot refresh balances: No provider or account');
      return;
    }

    try {
      const address = this.currentAccount();
      
      // Perform balance checks
      const [ethBal, rawTokenBal, decimals] = await Promise.all([
        this.provider.getBalance(address),
        this.contract['balanceOf'](address),
        this.contract['decimals'](),
      ]);

      this.ethBalance.set(ethers.formatEther(ethBal));
      this.tokenBalance.set(ethers.formatUnits(rawTokenBal, decimals));
      console.log(`[Web3Service] Balances updated - ETH: ${this.ethBalance()}, DMT: ${this.tokenBalance()}`);
    } catch (err) {
      console.error('[Web3Service] Failed to refresh balances:', err);
    }
  }

  async mintTokens(amount: string | number): Promise<void> {
    if (!this.contract || !this.currentAccount()) {
      throw new Error('Contract or wallet not connected');
    }

    const decimals = await this.contract['decimals']();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    const tx = await this.contract['mint'](this.currentAccount(), parsedAmount);
    await tx.wait();
    
    // Auto-refresh balances after transaction
    await this.refreshBalances();
  }

  async transferTokens(to: string, amount: string | number): Promise<void> {
    if (!this.contract || !this.currentAccount()) {
      throw new Error('Contract or wallet not connected');
    }

    const decimals = await this.contract['decimals']();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    console.log(`[Web3Service] Transferring ${amount} DMT to ${to}`);
    const tx = await this.contract['transfer'](to, parsedAmount);
    await tx.wait();
    
    // Auto-refresh balances after transaction
    await this.refreshBalances();
    console.log(`[Web3Service] Transfer successful`);
  }
}