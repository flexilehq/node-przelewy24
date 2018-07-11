'use strict';
const request = require('request-promise');
const md5 = require('md5');
const queryString = require('query-string');
const Promise = require('bluebird');

class Przelewy24 {

  apiVersion = '3.2';

  constructor({
    merchantId,
    posId,
    salt,
    sandboxMode = false,
  }) {
    this.baseParams = {
      merchantId,
      posId,
      apiVersion: this.apiVersion,
    };

    this.sandboxMode = sandboxMode;
  }

  get baseUrl() {
    return `https://${this.sandboxMode ? 'sandbox' : 'secure'}.przelewy24.pl/`;
  }

  /**
   * @param {object} params
   * @param {string} params.sessionId
   * @param {uint} params.amount
   * @param {string} params.currency
   * @param {string} params.description
   * @param {string} params.email
   * @param {string} params.country
   * @param {string} params.returnUrl
   * @param {string} params.statusUrl
   *
   * @returns {string} - Payment token.
   */
  async generatePaymentToken(params) {
    const response = await this._post('trnRegister', params);

    return response.token;
  }

  /**
   *
   * @param {object} params
   * @params {string} params.checksum
   * @param {string} params.sessionId
   * @param {uint} params.amount
   * @param {string} params.currency
   * @param {string} params.description
   * @param {string} params.email
   * @param {string} params.country
   * @param {string} params.returnUrl
   * @param {string} params.statusUrl
   *
   * @returns {string} - Payment token.
   */
  async generatePaymentUrl(params) {
    const token = await this.generatePaymentToken(params);

    return this._getUrl(`trnRequest/${token}`);
  }

  /**
   *
   * @param {object} params
   * @params {string} params.checksum
   * @param {string} params.sessionId
   * @param {uint} params.amount
   * @param {string} params.currency
   * @param {int} params.orderId
   *
   * @returns {Promise<boolean>}
   */
  async verifyPayment(params) {
    await this._post('trnVerify', params);

    return true;
  }

  _mapParamsToForm(params) {
    const form = {
      p24_merchant_id: params.merchantId,
      p24_pos_id: params.posId,
      p24_sign: params.checksum,
      p24_session_id: params.sessionId,
      p24_amount: params.amount,
      p24_currency: params.currency,
      p24_description: params.description,
      p24_email: params.email,
      p24_language: params.language,
      p24_country: params.country,
      p24_url_return: params.returnUrl,
      p24_url_status: params.statusUrl,
      p24_encoding: params.encoding,
      p24_api_version: params.apiVersion,
    };

    Object.keys(form).forEach((key) => {
      const value = form[key];
      if (value === null || value === undefined) {
        delete form[key];
      }
    });

    return form;
  }

  _getUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }

  _getFormBody(params) {
    const joinedParams = {
      ...this.baseParams,
      ...params,
    };

    return this._mapParamsToForm(joinedParams);
  }

  async _post(endpoint, params) {
    const form = this._getFormBody(params);
    const rawResponse = await request.post(this._getUrl(endpoint), { form });
    const response = queryString.parse(rawResponse);

    if (response.error === '0') {
      return Promise.reject('An error occurred while registering your payment.');
    }
    return response;
  }
}

module.exports = Przelewy24;
