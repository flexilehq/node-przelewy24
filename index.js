'use strict';
const request = require('request');
const md5 = require('md5');
const queryString = require('query-string');

class przelewy24 {
  constructor(p) {
    Object.assign(p);
    this.urls = {
      trnTest: this.sandbox ? 'https://sandbox.przelewy24.pl/testConnection' : 'https://secure.przelewy24.pl/testConnection',
      trnRegister: this.sandbox ? 'https://sandbox.przelewy24.pl/trnRegister' : '	https://secure.przelewy24.pl/trnRegister',
      trnRequest: this.sandbox ? 'https://sandbox.przelewy24.pl/TrnRequest/{TOKEN}' : 'https://secure.przelewy24.pl/trnRequest/{TOKEN}',
      trnVerify: this.sandbox ? 'https://sandbox.przelewy24.pl/trnVerify' : 'https://secure.przelewy24.pl/trnVerify'
    }
  }

  generatePaymentLink(p) {
    const form = {
      p24_merchant_id: this.merchantId,
      p24_pos_id: this.merchantId,
      p24_sign: md5(p.sessionId + "|" + this.merchantId + "|" + p.amount + "|" + p.currency + "|" + this.crc),
      p24_session_id: p.sessionId,
      p24_amount: p.amount,
      p24_currency: p.currency,
      p24_description: p.description,
      p24_email: p.mail,
      p24_language: p.language,
      p24_country: p.country,
      p24_url_return: p.urlReturn,
      p24_url_status: p.urlStatus,
      p24_api_version: '3.2',
      p24_encoding: 'UTF-8'
    };
    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        uri: this.urls.trnRegister,
        formData: form,
      }, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          try {
            var res = queryString.parse(body);
            if(res.error == 0 && typeof(res.error) != 'undefined'){
              const finalResponse = {
                token: res.token,
                url: this.urls.trnRequest.replace('{TOKEN}', res.token)
              };
              resolve(finalResponse);
            } else {
              reject('P24 error');
            }
          } catch(e) {
            reject(e);
          }
        }
      });
    });
  }

  confirmPayment(p) {
    const form = {
      p24_merchant_id: this.merchantId,
      p24_pos_id: this.merchantId,
      p24_sign: md5(p.sessionId + "|" + this.merchantId + "|" + p.amount + "|" + p.currency + "|" + this.crc), //md5(this.merchant_id + "|" + this.crc),
      p24_session_id: p.sessionId,
      p24_amount: p.amount,
      p24_currency: p.currency,
      p24_order_id: p.orderId
    };

    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        uri: 'https://secure.przelewy24.pl/trnVerify',
        formData: form,

      }, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          try {
            var res = queryString.parse(body);
            if(res.error == 0 && typeof(res.error) != 'undefined'){
              resolve();
            } else {
              reject();
            }
          } catch(e) {
            reject(e);
          }
        }
      });
    });
  }
}

module.exports = przelewy24;
