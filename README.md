# przelewy24

## Install
`npm install przelewy24`

## How to use

```javascript
const przelewy24 = require('przelewy24');
const p24 = new przelewy24({
  marchantId: 12345,
  crc: 'abcdefghijklmnop',
  sandbox: true //default is false
});
```

### Step 1 - Request payment link
```javascript
const options = {
  sessionId: '12345678', //Random id
  amount: 150, //1.50 PLN
  currency: 'PLN',
  urlReturn: `https://foo.bar/receipt/${sessionId}/`, //Redirect user here
  urlStatus: 'https://foo.bar/api/paymentCompleted/', //Confirm payment status here
  mail: 'user@gmail.com',
  description: `Cool product payment #12345678`,
  language: 'pl',
  country: 'PL'
};
try {
  const link = await p24.generatePaymentLink(options);
  console.log(`Payment link: ${link}`);
} catch(e) {
  console.log('It was unable to create payment', e);
}
```

### Step 2 - Confirm payment
```javascript
const options = {
  sessionId: '12345678',
  amount: 150, //
  currency: 'PLN', //post.p24_currency
  orderId: '...', //post.p24_session_id
  sign: '...' //post.p24_sign
}
try {
  await p24.confirmPayment(options);
  console.log('Payment confirmed');
} catch(e) {
  console.log('It was unable to confirm payment', e);
}
```
