(() => {
  const input = document.getElementById('input');
  const password = document.getElementById('password');
  const output = document.getElementById('output');
  const buttonEncrypt = document.getElementById('button-encrypt');
  const buttonDecrypt = document.getElementById('button-decrypt');

  // Based off of https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm (allows a non-encrypted value to be passed)
  async function getDecryptedValue(encryptedValue, encryptionPassword) {
    const keyUtf8 = new TextEncoder().encode(encryptionPassword);
    const keyHash = await crypto.subtle.digest('SHA-256', keyUtf8);

    try {
      const ivString = atob(encryptedValue).slice(0, 12);
      const iv = new Uint8Array(Array.from(ivString).map((char) => char.charCodeAt(0)));

      const algorithm = { name: 'AES-GCM', iv: iv };

      const encryptionKey = await crypto.subtle.importKey('raw', keyHash, algorithm, false, ['decrypt']);

      const ciphertextString = atob(encryptedValue).slice(12);
      const ciphertextUint8 = new Uint8Array(Array.from(ciphertextString).map((char) => char.charCodeAt(0)));

      const decryptedValueBuffer = await crypto.subtle.decrypt(algorithm, encryptionKey, ciphertextUint8);
      const decryptedValue = new TextDecoder().decode(decryptedValueBuffer);

      return decryptedValue;
    } catch (error) {
      console.log('Decrypt failed. Potentially unencrypted value found.', error);
    }

    return encryptedValue;
  }

  // Based off of https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm
  async function getEncryptedValue(decryptedValue, encryptionPassword) {
    const keyUtf8 = new TextEncoder().encode(encryptionPassword);
    const keyHash = await crypto.subtle.digest('SHA-256', keyUtf8);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivString = Array.from(iv).map((byte) => String.fromCharCode(byte)).join('');

    const algorithm = { name: 'AES-GCM', iv };

    const encryptionKey = await crypto.subtle.importKey('raw', keyHash, algorithm, false, ['encrypt']);

    const decryptedValueUint8 = new TextEncoder().encode(decryptedValue);
    const ciphertextBuffer = await crypto.subtle.encrypt(algorithm, encryptionKey, decryptedValueUint8);

    const ciphertextArray = Array.from(new Uint8Array(ciphertextBuffer));
    const ciphertextString = ciphertextArray.map((byte) => String.fromCharCode(byte)).join('');

    return btoa(`${ivString}${ciphertextString}`);
  }

  buttonEncrypt.addEventListener('click', async () => {
    const encryptedValue = await getEncryptedValue(input.value, password.value);
    output.value = encryptedValue;
  });

  buttonDecrypt.addEventListener('click', async () => {
    const decryptedValue = await getDecryptedValue(input.value, password.value);
    output.value = decryptedValue;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js');
  }
})();
