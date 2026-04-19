import { Injectable, signal, computed, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { DEMO_TOKEN_ABI, DEMO_TOKEN_ADDRESS } from '../contracts/demo-token';

export interface Activity {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

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
  public activities = signal<Activity[]>([]);
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
          this.addActivity('Wallet Disconnected', 'warning');
          this.currentAccount.set('');
          this.ethBalance.set('0');
          this.tokenBalance.set('0');
        } else {
          try {
            this.addActivity('Account Changed - Resyncing...', 'info');
            await this.connectWallet();
          } catch (err) {
            console.error('[Web3Service] Error syncing on account change:', err);
          }
        }
      });
    });

    window.ethereum.on('chainChanged', () => {
      console.log('[Web3Service] chainChanged - reloading page');
      this.addActivity('Network Changed - Reloading...', 'warning');
      window.location.reload();
    });
  }

  public addActivity(message: string, type: Activity['type'] = 'info') {
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date(),
    };
    // Add to the beginning of the array so newest is first
    this.activities.set([newActivity, ...this.activities()]);
  }

  public clearActivities() {
    this.activities.set([]);
  }

  async connectWallet(): Promise<string> {
    console.log('[Web3Service] connectWallet start');

    if (!window.ethereum) {
      this.addActivity('MetaMask not found!', 'error');
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
    this.addActivity(`Wallet Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`, 'success');
    
    return address;
  }

  async refreshBalances(): Promise<void> {
    if (!this.provider || !this.currentAccount()) return;

    try {
      const address = this.currentAccount();
      const [ethBal, rawTokenBal, decimals] = await Promise.all([
        this.provider.getBalance(address),
        this.contract['balanceOf'](address),
        this.contract['decimals'](),
      ]);

      this.ethBalance.set(ethers.formatEther(ethBal));
      this.tokenBalance.set(ethers.formatUnits(rawTokenBal, decimals));
    } catch (err) {
      console.error('[Web3Service] Failed to refresh balances:', err);
    }
  }

  async mintTokens(amount: string | number): Promise<void> {
    if (!this.contract || !this.currentAccount()) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      this.addActivity(`Minting ${amount} DMT...`, 'info');
      const decimals = await this.contract['decimals']();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      const tx = await this.contract['mint'](this.currentAccount(), parsedAmount);
      this.addActivity(`Transaction Sent - Pending Confirmation...`, 'info');
      
      await tx.wait();
      
      await this.refreshBalances();
      this.addActivity(`Successfully Minted ${amount} DMT`, 'success');
    } catch (err: any) {
      this.addActivity(`Minting Failed: ${err.message || 'Unknown Error'}`, 'error');
      throw err;
    }
  }

  async transferTokens(to: string, amount: string | number): Promise<void> {
    if (!this.contract || !this.currentAccount()) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      this.addActivity(`Transferring ${amount} DMT to ${to.substring(0, 6)}...`, 'info');
      const decimals = await this.contract['decimals']();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      const tx = await this.contract['transfer'](to, parsedAmount);
      this.addActivity(`Transfer Pending...`, 'info');
      
      await tx.wait();
      
      await this.refreshBalances();
      this.addActivity(`Transferred ${amount} DMT successfully`, 'success');
    } catch (err: any) {
      this.addActivity(`Transfer Failed: ${err.message || 'Unknown Error'}`, 'error');
      throw err;
    }
  }
}