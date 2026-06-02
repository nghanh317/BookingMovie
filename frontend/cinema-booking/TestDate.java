import java.text.SimpleDateFormat;
import java.util.Date;
public class TestDate {
    public static void main(String[] args) throws Exception {
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        Date d = sdf.parse("2026-06-02 00:00:00");
        System.out.println(sdf.format(d));
        SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd");
        System.out.println(iso.format(d));
    }
}
