import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Web3Service } from './services/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Transfer Form State
  recipient = '';
  transferAmount = '';

  // UI Loading/Status state
  loading = false;
  status = '';
  error = '';

  constructor(
    public web3: Web3Service,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async connectWallet() {
    console.log('[App] connectWallet clicked');

    try {
      this.loading = true;
      this.error = '';
      this.status = 'Connecting to wallet...';
      
      await this.web3.connectWallet();
      
      this.ngZone.run(() => {
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

      this.ngZone.run(() => {
        this.status = 'Mint successful';
        this.loading = false;
        this.cdr.detectChanges();
      });

      // Clear status after delay
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.status === 'Mint successful') {
            this.status = '';
            this.cdr.detectChanges();
          }
        });
      }, 3000);
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

  async transfer() {
    console.log('[App] transfer clicked');
    
    if (!this.recipient || !this.transferAmount) {
      this.error = 'Please provide recipient and amount';
      return;
    }

    try {
      this.loading = true;
      this.error = '';
      this.status = `Transferring ${this.transferAmount} DMT...`;
      this.cdr.detectChanges();

      await this.web3.transferTokens(this.recipient, this.transferAmount);

      this.ngZone.run(() => {
        this.status = 'Transfer successful';
        this.loading = false;
        this.recipient = '';
        this.transferAmount = '';
        this.cdr.detectChanges();
      });

      // Clear status after delay
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.status === 'Transfer successful') {
            this.status = '';
            this.cdr.detectChanges();
          }
        });
      }, 3000);
    } catch (err: any) {
      console.error('[App] transfer failed:', err);
      this.ngZone.run(() => {
        this.error = err?.message || 'Transfer failed';
        this.status = '';
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  clearActivities() {
    this.web3.clearActivities();
  }
}