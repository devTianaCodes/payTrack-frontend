export function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod.type !== 'card') return paymentMethod.name;
  return `${getCardBrand(paymentMethod)} ${maskCard(paymentMethod.lastFour)}`;
}

export function getCardBrand(paymentMethod) {
  return paymentMethod.name
    .replace(/\s+ending\s+\d{4}$/i, '')
    .replace(/\s+\d{4}$/i, '')
    .trim();
}

export function maskCard(lastFour) {
  return lastFour ? `**** ${lastFour}` : '****';
}
