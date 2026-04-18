import { Injectable } from '@angular/core';
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
  private account = '';

  async connectWallet(): Promise<string> {
    console.log('[Web3Service] connectWallet start');

    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);

    console.log('[Web3Service] requesting accounts');
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log('[Web3Service] accounts returned:', accounts);

    this.signer = await this.provider.getSigner();
    this.account = await this.signer.getAddress();
    console.log('[Web3Service] signer address:', this.account);

    this.contract = new ethers.Contract(
      DEMO_TOKEN_ADDRESS,
      DEMO_TOKEN_ABI,
      this.signer
    );
    console.log('[Web3Service] contract initialized');

    return this.account;
  }

  async getEthBalance(): Promise<string> {
    if (!this.provider || !this.account) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(this.account);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(): Promise<string> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or wallet not connected');
    }

    const rawBalance = await this.contract['balanceOf'](this.account);
    const decimals = await this.contract['decimals']();

    return ethers.formatUnits(rawBalance, decimals);
  }

  async mintTokens(amount: string): Promise<void> {
    if (!this.contract || !this.account) {
      throw new Error('Contract or wallet not connected');
    }

    const decimals = await this.contract['decimals']();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    const tx = await this.contract['mint'](this.account, parsedAmount);
    await tx.wait();
  }
}