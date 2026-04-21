export const generateKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  localStorage.setItem("privateKey", JSON.stringify(privateKeyJwk));
  return JSON.stringify(publicKeyJwk);
};

export const getPrivateKey = async (): Promise<CryptoKey | null> => {
  const jwkStr = localStorage.getItem("privateKey");
  if (!jwkStr) return null;
  return await window.crypto.subtle.importKey(
    "jwk", JSON.parse(jwkStr),
    { name: "ECDH", namedCurve: "P-256" },
    true, ["deriveKey"]
  );
};

export const importPublicKey = async (jwkStr: string): Promise<CryptoKey> => {
  return await window.crypto.subtle.importKey(
    "jwk", JSON.parse(jwkStr),
    { name: "ECDH", namedCurve: "P-256" },
    true, []
  );
};

const getSharedKey = async (publicKeyStr: string): Promise<CryptoKey | null> => {
  try {
    const privateKey = await getPrivateKey();
    if (!privateKey) return null;
    const publicKey = await importPublicKey(publicKeyStr);

    return await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: publicKey },
      privateKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (e) {
    return null;
  }
};

export const encryptMessage = async (text: string, otherPublicKeyStr: string): Promise<string> => {
  try {
    if (!otherPublicKeyStr) return text;
    const sharedKey = await getSharedKey(otherPublicKeyStr);
    if (!sharedKey) return text;

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      sharedKey,
      encoded
    );

    // Combine IV and Ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    return text;
  }
};

export const decryptMessage = async (cipherTextBase64: string, otherPublicKeyStr: string): Promise<string> => {
  try {
    if (!cipherTextBase64 || cipherTextBase64.length < 20 || !otherPublicKeyStr) return cipherTextBase64;
    
    const sharedKey = await getSharedKey(otherPublicKeyStr);
    if (!sharedKey) return cipherTextBase64;

    const combined = Uint8Array.from(atob(cipherTextBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      sharedKey,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    return cipherTextBase64;
  }
};
