import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getCardBrand,
  getPaymentMethodLabel,
  maskCard,
} from '../src/utils/paymentMethods.js';

describe('payment method labels', () => {
  it('masks card labels with only the last four digits visible', () => {
    const label = getPaymentMethodLabel({
      name: 'Visa',
      type: 'card',
      lastFour: '4242',
    });

    assert.equal(label, 'Visa **** 4242');
  });

  it('removes legacy ending text before displaying card labels', () => {
    const label = getPaymentMethodLabel({
      name: 'Visa ending 4242',
      type: 'card',
      lastFour: '4242',
    });

    assert.equal(label, 'Visa **** 4242');
  });

  it('keeps non-card payment methods unchanged', () => {
    const label = getPaymentMethodLabel({
      name: 'PayPal',
      type: 'paypal',
    });

    assert.equal(label, 'PayPal');
  });

  it('falls back to a generic mask when no last four digits are saved', () => {
    assert.equal(maskCard(null), '****');
  });

  it('cleans card brands with trailing digits', () => {
    assert.equal(getCardBrand({ name: 'Mastercard 1188' }), 'Mastercard');
  });
});
