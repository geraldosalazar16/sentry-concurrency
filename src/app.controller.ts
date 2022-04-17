import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as Sentry from '@sentry/node';
import "@sentry/tracing";

Sentry.init({
  dsn: 'dsn',
  tracesSampleRate: 0.5,
  environment: 'local',
});

@Controller()
export class AppController {
  users = [
    {
      id: '1',
      email: 'test1@gmail.com'
    },
    {
      id: '2',
      email: 'test2@gmail.com'
    },
    {
      id: '3',
      email: 'test3@gmail.com'
    }
  ]
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const userId = Math.round(Math.random() * 3)
    const user = this.users[userId]
    let shouldFail = false;
    const flip = Math.random();
    if (flip > 0.5) {
      shouldFail = true;
    }
    const transaction = Sentry.startTransaction({
      op: "transaction",
      name: "TransactionA",
    });
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
      scope.setContext(`additionalContext`, {
        user,
        flip,
        shouldFail
      });
      scope.setUser(user)
    });
    try {
      await this.doSomething(1000, shouldFail)
    } catch (error) {
      Sentry.captureException(new Error('Operation failed'))
    }
    
    transaction.finish();
    return 'finished'
  }

  doSomething(miliseconds: number, shouldFail: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(null)
        } else {
          resolve(null)
        }
      }, miliseconds)
    })
  }
}
