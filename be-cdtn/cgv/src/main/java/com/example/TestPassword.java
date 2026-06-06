// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// public class TestPassword {
//     public static void main(String[] args) {
//         BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
//         String testHash = "$2a$10$SEz1sd9tGf4l6keVGLnjW.tDh.xnKEUI5d07xcofW3XlXEfE54H5S";
//         String adminHash = "$2b$10$2fTZd5F/kKnrBRjvvkHIHucZr8kuuOwJ4HTYq3Vxm4a5meA8ASsj2";
        
//         String[] passwords = {"123456", "123123", "admin", "test", "password"};
        
//         System.out.println("Checking 'test' account hash:");
//         for(String pwd : passwords) {
//             if(encoder.matches(pwd, testHash)) {
//                 System.out.println("Match found! Password for 'test' is: " + pwd);
//             }
//         }
        
//         System.out.println("\nChecking 'admin' account hash:");
//         for(String pwd : passwords) {
//             if(encoder.matches(pwd, adminHash)) {
//                 System.out.println("Match found! Password for 'admin' is: " + pwd);
//             }
//         }
//     }
// }
