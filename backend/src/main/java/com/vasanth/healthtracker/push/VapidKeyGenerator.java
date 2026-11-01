package com.vasanth.healthtracker.push;

import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;

public class VapidKeyGenerator {

    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public record KeyPairStrings(String publicKey, String privateKey) {}

    public static KeyPairStrings generate() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("ECDH", "BC");
        generator.initialize(new ECGenParameterSpec(Utils.CURVE));
        KeyPair pair = generator.generateKeyPair();

        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        String publicKey = encoder.encodeToString(Utils.encode((ECPublicKey) pair.getPublic()));
        String privateKey = encoder.encodeToString(Utils.encode((ECPrivateKey) pair.getPrivate()));
        return new KeyPairStrings(publicKey, privateKey);
    }
}
