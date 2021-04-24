import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { interval, Subscription, } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
interface wsQuetions {
  question: string,
  answers: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  private socket$: WebSocketSubject<any>;
  loading = false;
  started = false;
  wsQuestions: wsQuetions;
  progressbarValue = 100;
  timeSub: Subscription;
  url = window.location.host.split(':')[0];

  constructor(private _sanitized: DomSanitizer, private _snackBar: MatSnackBar) { }

  ngOnInit() {

  }

  start() {
    this.socket$ = webSocket(`ws://${this.url}:8080`);
    this.loading = true;
    this.socket$
      .subscribe(
        (msg: any) => {
          switch (msg) {
            case 'you lost':
              this.showSnakbar('Sorry you lost. No candy for you 😥');
              this.resetGame();
              break;
            case 'you won':
              this.showSnakbar('Congratulations, you won some candy 😃');
              this.resetGame();
              break;
            case 'app in use':
              this.showSnakbar('Sorry app is in use 😔')
              break;
            case 'time\'s up':
              this.showSnakbar('Time\'s up 😔');
              this.resetGame();
              break;
            default:
              this.wsQuestions = msg;
              this.startGame();
          }
        }, // Called whenever message from the server.
        err => {
          this.resetGame();
          if (err?.code !== 1006) this.showSnakbar('something went wrong 😔');
        },// Called if WebSocket error.
        () => { this.loading = false; }  // Called when connection is closed.
      );
  }

  answered(answer: string) {
    this.timeSub.unsubscribe();
    this.socket$.next({ answer: answer });
  }

  transform(something: string) {
    return this._sanitized.bypassSecurityTrustHtml(something);
  }

  // should be done from the server 
  startTimer(seconds: number) {
    const timer$ = interval(1000);
    let current = 0;
    this.timeSub = timer$.subscribe((sec) => {
      this.progressbarValue = 100 - sec * 100 / seconds;
      current = sec;
      if (current === seconds) {
        this.timeSub.unsubscribe();
      }
    });
  }

  resetGame() {
    this.loading = false;
    this.started = false;
    this.timeSub?.unsubscribe();
    this.progressbarValue = 100;
    this.socket$.complete();
  }

  startGame() {
    this.loading = false;
    this.started = true;
    this.startTimer(30);
  }

  showSnakbar(message: string) {
    this._snackBar.open(message, null, { duration: 3000, verticalPosition: 'top' });
  }

}
