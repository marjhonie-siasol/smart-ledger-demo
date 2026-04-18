import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './services/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  address = '';
  ethBalance = '0';
  tokenBalance = '0';
  loading = false;
  status = '';
  error = '';

  constructor(
    private web3: Web3Service,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async connectWallet() {
    console.log('[App] connectWallet clicked');

    try {
      this.loading = true;
      this.error = '';
      this.status = 'Connecting to wallet...';
      this.cdr.detectChanges();

      console.log('[App] before connectWallet service call');
      const address = await this.web3.connectWallet();
      console.log('[App] address received:', address);

      console.log('[App] before getEthBalance');
      const ethBalance = await this.web3.getEthBalance();
      console.log('[App] eth balance:', ethBalance);

      console.log('[App] before getTokenBalance');
      const tokenBalance = await this.web3.getTokenBalance();
      console.log('[App] token balance:', tokenBalance);

      this.ngZone.run(() => {
        this.address = address;
        this.ethBalance = ethBalance;
        this.tokenBalance = tokenBalance;
        this.status = '';
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (err: any) {
      console.error('[App] connectWallet failed:', err);

      this.ngZone.run(() => {
        this.error = err?.message || 'Connection failed';
        this.status = '';
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  async mint() {
    console.log('[App] mint clicked');

    try {
      this.loading = true;
      this.error = '';
      this.status = 'Minting 100 DMT...';
      this.cdr.detectChanges();

      await this.web3.mintTokens('100');

      const ethBalance = await this.web3.getEthBalance();
      const tokenBalance = await this.web3.getTokenBalance();

      this.ngZone.run(() => {
        this.ethBalance = ethBalance;
        this.tokenBalance = tokenBalance;
        this.status = 'Mint successful';
        this.loading = false;
        this.cdr.detectChanges();
      });

      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.status === 'Mint successful') {
            this.status = '';
            this.cdr.detectChanges();
          }
        });
      }, 2000);
    } catch (err: any) {
      console.error('[App] mint failed:', err);

      this.ngZone.run(() => {
        this.error = err?.message || 'Mint failed';
        this.status = '';
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }
}