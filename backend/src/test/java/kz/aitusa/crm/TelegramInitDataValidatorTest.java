package kz.aitusa.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import kz.aitusa.crm.config.AppProperties;
import kz.aitusa.crm.security.TelegramInitDataValidator;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TelegramInitDataValidatorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void validatesSignedTelegramInitData() throws Exception {
        AppProperties props = new AppProperties();
        props.setBotToken("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
        props.setDemoMode(false);
        TelegramInitDataValidator validator = new TelegramInitDataValidator(props, objectMapper);

        long now = 1700000100L;
        String authDate = "1700000000";
        String userJson = "{\"id\":777888,\"first_name\":\"Kuandyk\"}";
        String dataCheckString = "auth_date=" + authDate + "\nuser=" + userJson;

        Mac macKey = Mac.getInstance("HmacSHA256");
        macKey.init(new SecretKeySpec("WebAppData".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] secret = macKey.doFinal(props.getBotToken().getBytes(StandardCharsets.UTF_8));

        Mac macHash = Mac.getInstance("HmacSHA256");
        macHash.init(new SecretKeySpec(secret, "HmacSHA256"));
        String hash = HexFormat.of().formatHex(macHash.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8)));

        String raw = "auth_date=" + authDate
                + "&user=" + URLEncoder.encode(userJson, StandardCharsets.UTF_8)
                + "&hash=" + hash;

        long userId = validator.validateInitData(raw, props.getBotToken(), 3600, now);
        assertEquals(777888L, userId);
    }

    @Test
    void rejectsExpiredOrTamperedInitData() {
        AppProperties props = new AppProperties();
        props.setBotToken("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
        TelegramInitDataValidator validator = new TelegramInitDataValidator(props, objectMapper);

        String raw = "auth_date=1700000000&user=%7B%22id%22%3A1%7D&hash=deadbeef";
        assertThrows(IllegalArgumentException.class,
                () -> validator.validateInitData(raw, props.getBotToken(), 3600, 1700000100L));
    }

    @Test
    void supportsDemoAuthorizationInLocalMode() {
        AppProperties props = new AppProperties();
        props.setDemoMode(true);
        TelegramInitDataValidator validator = new TelegramInitDataValidator(props, objectMapper);

        assertEquals(100000002L, validator.validateHeader("tma demo:100000002"));
        assertEquals(100000001L, validator.validateHeader(null));
    }
}
