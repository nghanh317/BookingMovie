import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GenAITest {
    public static void main(String[] args) {
        try {
            Client client = Client.builder().apiKey("DUMMY").build();
            List<Content> contents = new ArrayList<>();
            contents.add(Content.builder().role("user").parts(Collections.singletonList(Part.fromText("Hi"))).build());
            
            GenerateContentConfig config = GenerateContentConfig.builder().build();
            
            GenerateContentResponse response = client.models.generateContent("dummy-model", contents, config);
            System.out.println("Success");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
