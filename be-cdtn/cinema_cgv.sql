-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cinema_cgv
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'trongprovip1','$2b$10$ZNao9EdAa5mIU/ETH5h8zOfyblthvEanIvbO2S/Iv6TFD3sx51xGu','duongtrong1306@gmail.com','0972199914','trongprovip',NULL,'user','2026-03-08 17:55:24',NULL,0),(2,'admin','$2b$10$2fTZd5F/kKnrBRjvvkHIHucZr8kuuOwJ4HTYq3Vxm4a5meA8ASsj2','admin@cgv.com','0987654321','admin',NULL,'admin','2026-03-08 17:55:50',NULL,0),(3,'trongahaha','$2b$10$.5GooyJVB2tD287MJJjtK.YnkhVfSe9t7vRzwBgZ1GpKpypSNvC1C','duongtrong13062004@gmail.com','0987654322','trongahihi','/avatars/user_3_1773017888135.jpg','user','2026-03-08 17:56:29','2026-03-09 00:58:08',0);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookingseats`
--

DROP TABLE IF EXISTS `bookingseats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookingseats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tickets_id` int unsigned NOT NULL,
  `seat_id` int unsigned NOT NULL,
  `seat_price` decimal(10,2) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_id` (`tickets_id`,`seat_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `bookingseats_ibfk_1` FOREIGN KEY (`tickets_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `bookingseats_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookingseats`
--

LOCK TABLES `bookingseats` WRITE;
/*!40000 ALTER TABLE `bookingseats` DISABLE KEYS */;
INSERT INTO `bookingseats` VALUES (1,1,78,96000.00,0),(2,2,71,80000.00,0),(3,3,10,120000.00,0),(4,4,10,120000.00,0);
/*!40000 ALTER TABLE `bookingseats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinemas`
--

DROP TABLE IF EXISTS `cinemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinemas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `province_id` int unsigned NOT NULL,
  `cinema_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `cinemas_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinemas`
--

LOCK TABLES `cinemas` WRITE;
/*!40000 ALTER TABLE `cinemas` DISABLE KEYS */;
INSERT INTO `cinemas` VALUES (1,1,'CGV Vincom Center Bà Triệu','191 Bà Triệu, Hà Nội',21.01118920,105.84947050,'active','0924783748','vincombt@gmail.com','2026-03-08 18:24:42',0),(2,1,'CGV Hồ Gươm Plaza','102-104 Đường Trần Phú - Hà Đông Hanoi 100000',20.97461170,105.78084520,'active','0958345734','cgvhoguom@gmail.com','2026-03-08 18:25:33',0),(3,1,'CGV Aeon Long Biên','Long Biên , Hà Nội',21.03987130,105.85002160,'active','0953453453','aeonlongbien@gmail.com','2026-03-08 18:26:07',0),(4,2,'CGV Vincom Hải Phòng','Hùng Vương, Hải Phòng',20.87374710,106.63667080,'active','0973284727','vincomhp@gmail.com','2026-03-08 18:27:24',0),(5,2,'CGV Aeon Mall Hải Phòng','Cầu Bính, Hải Phòng',20.87512870,106.66755580,'active','0947324234','aeonhp@gmail.com','2026-03-08 18:28:15',0),(6,3,'CGV Vincom Hạ Long','Lê Thánh Tông, Quảng Ninh',20.95158930,107.08576590,'active','0972446724','vincomhp@gmail.com','2026-03-08 18:29:36',0),(7,3,'CGV Vincom Cẩm Phả','Hồng Ngọc , Quảng Ninh',20.95016980,107.08250700,'active','0973647264','vincomcp@gmail.com','2026-03-08 18:30:30',0),(8,4,'CGV Kim Cúc Plaza','Bình Định',NULL,NULL,'active','0983248728','kimcucplaza@gmail.com','2026-03-08 18:31:26',0),(9,5,'CGV Ecopark Hưng Yên','Hưng Yên',20.65893140,106.06198570,'active','0932462742','ecoparkhy@gmail.com','2026-03-08 18:32:06',0),(10,6,'CGV Vincom Lạng Sơn','Lạng Sơn',21.85105360,106.76218120,'active','0967364724','vincomlangson@gmail.com','2026-03-08 18:32:47',0);
/*!40000 ALTER TABLE `cinemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `movie_id` int unsigned NOT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_id` (`account_id`,`movie_id`),
  KEY `idx_favorites_movie_id` (`movie_id`),
  KEY `idx_favorites_account_id` (`account_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,3,10,'2026-03-09 00:41:50',0),(2,3,9,'2026-03-09 00:43:21',0),(3,1,10,'2026-03-09 01:01:40',0),(4,1,8,'2026-03-09 01:01:43',0),(5,1,9,'2026-03-09 01:01:45',0);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moviecinemas`
--

DROP TABLE IF EXISTS `moviecinemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moviecinemas` (
  `movie_id` int unsigned NOT NULL,
  `cinema_id` int unsigned NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`movie_id`,`cinema_id`),
  KEY `cinema_id` (`cinema_id`),
  CONSTRAINT `moviecinemas_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `moviecinemas_ibfk_2` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moviecinemas`
--

LOCK TABLES `moviecinemas` WRITE;
/*!40000 ALTER TABLE `moviecinemas` DISABLE KEYS */;
/*!40000 ALTER TABLE `moviecinemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration` int NOT NULL,
  `release_date` date DEFAULT NULL,
  `director` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cast` text COLLATE utf8mb4_unicode_ci,
  `genre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poster_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trailer_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('coming_soon','now_showing','ended') COLLATE utf8mb4_unicode_ci DEFAULT 'coming_soon',
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'Avengers: Endgame','Biệt đội Avengers tập hợp lần cuối để đảo ngược hậu quả từ cú búng tay của Thanos.',181,'2025-11-13','Anthony Russo, Joe Russo','Robert Downey Jr., Chris Evans, Scarlett Johansson','Action, Adventure, Sci-Fi','English','https://th.bing.com/th/id/OIP.AsVeA2uTH8DIHIezO_yDGAHaK-?w=119&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=TcMBFSGVi1c&t=5s','now_showing','2026-03-09 00:57:25','2026-03-08 18:02:52',0),(2,'Spider-Man: No Way Home','Peter Parker phải đối mặt với hậu quả khi danh tính bị lộ và đa vũ trụ bị phá vỡ.',148,'2026-01-09','Jon Watts','Tom Holland, Zendaya, Benedict Cumberbatch','Action, Adventure, Fantasy','English','https://th.bing.com/th/id/OIP.jFWga73Vye9w2gQvqWJX6gHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=JfVOs4VSpmA&t=18s','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:04',0),(3,'Doraemon: Nobita and the Sky Utopia','Nobita và Doraemon phiêu lưu đến vương quốc trên bầu trời.',107,'2025-12-09','Takumi Doyama','Wasabi Mizuta, Megumi Ohara','Animation, Family, Fantasy','Japanese','https://th.bing.com/th/id/OIP.gvr7hO-OSR7Zbwf9-_w9RwHaHa?w=179&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=Ol6Z_QR-OH8','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:16',0),(4,'Godzilla x Kong: The New Empire','Godzilla và Kong đối đầu với mối đe dọa mới có thể hủy diệt thế giới.',115,'2026-02-12','Adam Wingard','Rebecca Hall, Brian Tyree Henry','Action, Sci-Fi','English','https://th.bing.com/th/id/OIP.OCOslhU1srFM_5vAPeUD5wHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://youtuhttps://www.youtube.com/watch?v=lV1OOlGwExM&t=17sbe.com/watch?v=example2','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:25',0),(5,'Inside Out 2','Những cảm xúc mới xuất hiện trong tâm trí của Riley khi cô bước vào tuổi teen.',96,'2026-02-12','Kelsey Mann','Amy Poehler, Phyllis Smith','Animation, Comedy, Family','English','https://th.bing.com/th/id/OIP.s01urkcK6XmX5n-wjk3xpgHaK-?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=VWavstJydZU','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:36',0),(6,'THỎ ƠI!!','Phim “Thỏ ơi!!” dự kiến công chiếu trong dịp Tết 2026, thuộc thể loại hài, tâm lý sở trường của Trấn Thành, mang màu sắc trẻ trung với dàn diễn viên mới, tiếp nối tinh thần đem đến cho khán giả những điều vui vẻ, hài hước vào dịp Tết Nguyên đán.',127,'2026-02-17','Trấn Thành','Pháo; Lyly; Trấn Thành; Pháp Kiều; Gil Lê; Cris Phan; Ali Hoàng Dương; BB Trần; Đinh Ngọc Diệp','Tâm Lý','Tiếng Việt - Phụ đề Tiếng Anh','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/t/o/to_poster_official_tiectet_3x4_fa.jpg','https://www.youtube.com/watch?v=aJOXdRSj91g','now_showing','2026-03-08 18:07:35',NULL,0),(7,'CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI','Cảm Ơn Người Đã Thức Cùng Tôi là một hành trình cảm xúc của những người trẻ đi tìm đáp án cho câu hỏi “Ước mơ của bạn là gì?”, để rồi chính họ khi bước vào thế giới trưởng thành dần nhận ra câu hỏi quan trọng nhất là “Mình muốn thực hiện ước mơ đó cùng ai?”',137,'2026-02-27','Chung Chí Công','Võ Phan Kim Khánh, Trần Doãn Hoàng, Nguyễn Hùng','Gia đình, Tình cảm','Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/m/a/main_condtct_cinema_low.jpg','https://www.youtube.com/watch?v=uf2oOeJ-Z3s&list=RDuf2oOeJ-Z3s&start_radio=1','now_showing','2026-03-08 18:08:43',NULL,0),(8,'BÁU VẬT TRỜI CHO','BÁU VẬT TRỜI CHO - bộ phim đa sắc cảm xúc, rực rỡ yêu thương, gắn kết gia đình Tết 2026. Ngọc (Phương Anh Đào) là mẹ đơn thân, có con nhờ thụ tinh nhân tạo từ tinh trùng hiến tặng. Trong chuyến đi biển để đổi gió và trốn chạy quá khứ, cô & Tô chạm mặt Hồng (Tuấn Trần) – chàng trai làng chài phóng khoáng, cũng chính là người góp phần tạo nên sự ra đời của Tô. Cuộc gặp gỡ tréo ngoe ấy kéo ba con người xa lạ vào hàng loạt tình huống dở khóc dở cười lẫn căng thẳng, khi mọi thứ bắt đầu vượt ngoài kế hoạch. Liệu người cha “trời cho” này là món quà bất ngờ của số phận, hay chỉ là một “trò chơi” oái oăm cuộc đời?',124,'2026-02-17','Lê Thanh Sơn','NSND Kim Xuân, Tuấn Trần, Phương Anh Đào, Võ Tấn Phát, Hưng Nguyễn, La Thành, Trung Dân, Khương Lê, Tạ Lâm, Quách Ngọc Ngoan, Chị Phiến, Thư Đan…','Gia đình, Hài, Tình cảm','Tiếng Việt - Phụ đề tiếng Anh','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470wx700h-bvtc_3.jpg','https://www.youtube.com/watch?v=dwfUi9SV5ss','now_showing','2026-03-08 18:10:04',NULL,0),(9,'KHÔNG CÒN CHÚNG TA','Jeong-won và Eun-ho yêu nhau chân thành và sâu đậm bằng những tất cả những gì họ có ở khoảng thời gian đẹp nhất của thanh xuân. Nhưng tình yêu của tuổi trẻ không tránh khỏi sự non nớt, bồng bột để rồi họ chọn rời xa nhau. Nhiều năm sau gặp lại, họ nhận ra: chính những tháng năm đã yêu và đã đau ấy đã giúp họ trưởng thành hơn, hiểu được tình yêu và biết cách yêu thương hơn. Chỉ tiếc rằng khi ấy, yêu thương này họ không dành cho nhau được nữa…',114,'2026-03-06','Kim Do-Young','Koo Kyo-hwan, Moon Ga-young, Suyeon Ji','Tâm Lý, Tình cảm','Tiếng Hàn – Phụ đề tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470x700-us.jpg','https://www.youtube.com/watch?v=DltytoKP7Rg','now_showing','2026-03-08 18:11:24',NULL,0),(10,'MÙI PHỞ','Câu chuyện về sự xung đột thế hệ và những va chạm giữa quan niệm cũ và lối sống hiện đại, xoay quanh món Phở - biểu tượng ẩm thực Việt. Đằng sau những mâu thuẫn và tranh cãi ấy, từng bí mật dần được hé lộ, mở ra hành trình tìm lại sự ấm áp của tình thân qua những tình tiết hài hước, dí dỏm và đầy duyên dáng.',111,'2026-02-17','Minh Beta','Xuan Hinh - Thu Trang - Thanh Thanh Hien - Quoc Tuan - Bao Nam - Ha Huong - Thanh Huong - Chu Manh Cuong - Tien Loc','Gia đình, Hài','Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/3/5/350x495-muipho.jpg','https://www.youtube.com/watch?v=7L5qkIkkcY8','now_showing','2026-03-08 18:12:54',NULL,0),(11,'TỘI PHẠM 101','Lấy bối cảnh thành phố Los Angeles đầy nắng và bụi đường, Tội Phạm 101 kể về một tên trộm nữ trang bí ẩn (Chris Hemsworth) với hàng loạt phi vụ táo bạo khiến cảnh sát phải đau đầu. Trong lúc chuẩn bị cho phi vụ lớn nhất của mình, hắn gặp gỡ một nữ nhân viên bảo hiểm (Halle Berry), người cũng đang vật lộn với những lựa chọn trong đời mình. Trong khi đó, một thanh tra (Mark Ruffalo) đã tìm ra quy luật trong chuỗi các vụ án và đang ráo riết truy đuổi tên trộm, khiến cuộc chơi trở nên căng thẳng hơn bao giờ hết. Khi phi vụ định mệnh đến gần, ranh giới giữa kẻ săn đuổi và con mồi dần trở nên mờ nhạt và cả ba buộc phải đối mặt với những lựa chọn khó khăn và không còn cơ hội để quay đầu lại. Bộ phim được chuyển thể từ tiểu thuyết ngắn nổi tiếng cùng tên của Don Winslow, do Bart Layton (tác giả của American Animals, The Imposter) viết kịch bản và đạo diễn. Dàn diễn viên có sự tham gia của Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh và Nick Nolte.',129,'2026-03-13','Bart Layton','Chris Hemsworth, Mark Ruffalo, Halle Berry, Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh, Nick Nolte','Hồi hộp, Tội phạm','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster-crime.jpg','https://www.youtube.com/watch?v=TxY9GfEEMOI&t=2s','coming_soon','2026-03-08 18:14:09',NULL,0),(12,'CÔ DÂU!','Một cách tiếp cận táo bạo, phá vỡ mọi khuôn mẫu đối với một trong những câu chuyện hấp dẫn nhất thế giới. Bộ phim theo chân Frankenstein cô đơn (do Chrisitian Bale thủ vai) lên đường đến Chicago những năm 1930 để tìm đến nhà khoa học Dr. Euphronious (Annette Bening – 5 lần đề cử Oscar thủ vai), với hy vọng bà có thể tạo ra một người bạn đồng hành cho mình. Cả hai hồi sinh một cô gái trẻ đã bị sát hại, và Cô Dâu (Buckley thủ vai) đã ra đời. Những gì xảy ra sau đó đã vượt xa mọi tưởng tượng của họ: những vụ giết người, sự chiếm hữu, một phong trào văn hóa hoang dại và cấp tiến cũng như mối tình ngoài vòng pháp luật đầy cuồng nhiệt và bùng nổ!',126,'2026-03-13','Maggie Gyllenhaal','Jake Gyllenhaal, Christian Bale, Jessie Buckley,…','Kinh Dị, Nhạc kịch, Tình cảm','Tiếng Anh – phụ đề tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/m/a/main_poster_co_dau_1_final.jpg','https://www.youtube.com/watch?v=HYIOdcSGON4','coming_soon','2026-03-08 18:15:36',NULL,0),(13,'TIẾNG THÉT 7','Sidney Evans (Neve Campbell), nạn nhân sống sót của một vụ thảm sát nhiều năm trước, giờ đang sống hạnh phúc cùng chồng và con gái ở một thị trấn khác thì tên sát nhân Ghostface mới lại xuất hiện. Những nỗi sợ hãi đen tối nhất của cô trở thành hiện thực khi con gái cô Tatum Evans (Isabel May) trở thành mục tiêu tiếp theo. Quyết tâm bảo vệ gia đình, Sidney buộc phải đối mặt với những kinh hoàng trong quá khứ để chấm dứt cuộc đổ máu một lần và mãi mãi.',144,'2026-03-20','Kevin Williamson','Neve Campbell, Isabel May, Mckenna Grace, Courteney Cox, etc.','Bí ẩn, Kinh Dị','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/s/c/sc7_burnposter_470x700.jpg','https://www.youtube.com/watch?v=4g8OciWNJn4','coming_soon','2026-03-08 18:18:35',NULL,0),(14,'THOÁT KHỎI TẬN THẾ',NULL,111,'2026-03-20','Phil Lord, Christopher Miller','Ryan Gosling, Liz Kingsman, Milana Vayntrub, Sandra Hüller','Khoa Học Viễn Tưởng, Phiêu Lưu','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/3/5/350x495-mary.jpg','https://www.youtube.com/watch?v=ZhyHDNbxfcY&t=3s','coming_soon','2026-03-08 18:19:49',NULL,0),(15,'CHÚNG SẼ ĐOẠT MẠNG','Đến từ New Line Cinema và Nocturna, CHÚNG SẼ ĐOẠT MẠNG (tựa gốc: THEY WILL KILL YOU) là một tác phẩm kinh dị - hành động - hài hước đẫm máu và đầy kịch tính xoay quanh cuộc chiến sống còn của một người phụ nữ tại tòa nhà xa hoa The Virgil - hang ổ của một giáo phái ma quỷ. Khi màn đêm buông xuống, những cạm bẫy được giăng ra, kẻ không thể sống sót sẽ trở thành vật tế tiếp theo. Một trận chiến chết chóc mãn nhãn cùng phong cách hài đen đầy mê hoặc sẽ sớm bắt đầu trên màn ảnh rộng.',136,'2026-03-27','Kirill Sokolov','Zazie Beetz, Myha’La, Paterson Joseph, Tom Felton, Heather Graham, Patricia Arquette,...','Hài, Hành Động, Kinh Dị','Tiếng Anh – Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/v/n/vn_twky_vert_main_2764x4096_intl.jpg','https://www.youtube.com/watch?v=N-_NK612uH8','coming_soon','2026-03-08 18:21:24',NULL,0);
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Nhận mã giảm giá 20% nhân ngày mùng 8/3','Nhận mã giảm giá 20% nhân ngày mùng 8/3','https://th.bing.com/th/id/OIP.7kc5p4BCZKdq65yiZ0-cWAHaHa?w=181&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 00:20:34','2026-03-09 00:20:34',0),(2,'CHƯƠNG TRÌNH CÔ DÂU THE BRIDE & CHÚ RỂ FRANKENSTEIN TẶNG HOA NHÂN NGÀY QUỐC TẾ PHỤ NỮ 8/3','1. Thời gian và địa điểm áp dụng\n\n- Thời gian: 07/03/2026 – 08/03/2026\n\n- Khung giờ: 18:00 – 21:00\n\n- Địa điểm:\n\n+ TP. HCM: CGV Sư Vạn Hạnh\n\n+ HÀ NỘI: CGV Vincom Royal City\n\n\n2. Thời gian và địa điểm áp dụng\n\n- Trong khung giờ diễn ra chương trình, 02 người hóa trang thành nhân vật Cô Dâu và Frankenstein (hoặc nhân viên của đơn vị tổ chức) sẽ xuất hiện tại khu vực sảnh rạp để giao lưu và chụp hình cùng khách.\n\n- Người hóa trang sẽ phát ngẫu nhiên hoa hồng (được bọc trong giấy gói đen và có thẻ ghi chú thông tin về ngày khởi chiếu & QR code dẫn đến trailer phim) cho các khách hàng nữ có mặt tại sảnh rạp, nhằm hưởng ứng Ngày Quốc Tế Phụ Nữ 8/3.\n\n- Lưu ý: sự kiện có chụp ảnh/ghi hình.\n\n\n3. Cơ chế tham gia\n\n- Không yêu cầu mua vé.\n\n- Không yêu cầu xuất trình vé hoặc đăng ký trước.\n\n- Quà tặng được phát ngẫu nhiên cho khách (ưu tiên khách hàng nữ hoặc các nhóm có bạn nữ đi chung) có mặt tại sảnh trong thời gian chạy hoạt động.\n\n- Mỗi khách nhận tối đa 01 bông hoa, tùy theo số lượng quà thực tế.\n\n\n4. Trách nhiệm triển khai\n\n- Chương trình do đơn vị sản xuất/đối tác phụ trách tổ chức và vận hành.\n\n- Rạp chỉ hỗ trợ về mặt địa điểm theo phạm vi cho phép và phối hợp đảm bảo hoạt động không ảnh hưởng đến vận hành chung.\n\n- Rạp không chịu trách nhiệm phát quà hoặc xử lý khiếu nại liên quan đến quà tặng của chương trình.\n\n\n5. Lưu ý\n\n- Hoạt động chỉ diễn ra tại khu vực sảnh rạp và trong đúng khung giờ nêu trên.\n\n- Số lượng quà có hạn và có thể kết thúc sớm khi phát hết.\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/350x495_36_.jpg','2026-03-09 00:21:16','2026-03-09 00:21:16',0),(3,'SELF LOVE: YÊU MÌNH MỘT CHÚT!!!','Trong tháng 3 này, CGVxCoca-Cola mang đến một món quà với thông điệp yêu thương.\n\nSelf-love - không dành riêng cho ai, không cần lý do đặc biệt, chỉ đơn giản là:\n\nChọn bộ phim mình thích mà không cần chờ ai rủ.\n\nTự thưởng một combo bắp nước thật “đã”.\n\nTặng cho bản thân một món quà nhỏ nhưng đầy ý nghĩa.\n\n\nTẶNG TÚI TOTE “SELF LOVE”\n\nKhi mua hóa đơn bắp nước trị giá từ 219.000đ\n\n(bao gồm ít nhất 01 sản phẩm Coca-Cola)\n\n\n1. Áp dụng:  từ ngày 28/02/2026 đến 15/03/2026, tại tất cả các cụm rạp CGV trên toàn quốc.\n\n\n2. Điều kiện và điều khoản:\n\n- Chỉ áp dụng cho các giao dịch mua bắp nước trị giá từ 219.000đ, từ ngày 28/02/2026 đến hết ngày 15/03/2026\n\n- Hóa đơn mua bắp nước phải có ít nhất 01 sản phẩm Coca-cola thì hợp lệ\n\n- Không áp dụng cho giao dịch mua CGV TẾT BOTTLE COMBO – Bình Xuân Bính Ngọ\n\n- Áp dụng cho giao dịch online và offline tại tất cả cụm rạp CGV.\n\n- Khách hàng mua giao dịch tại rạp nào , nhận quà tặng tại rạp đó và nhận cùng thời điểm nhận bắp nước\n\n- Được áp dụng lũy tiến và áp dụng đồng thời với các chương trình khuyến mãi khác .\n\n- Không áp dụng tách hoặc gộp giá trị hóa đơn dưới mọi hình thức\n\n- Không áp dụng chương trình cho các hình thức thanh toán giao dịch bằng CGVian hoặc CJ Membership.\n\n- Số lượng quà tặng có giới hạn , chương trình có thể kết thúc sớm ngay khi hết hàng\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/SELF_LOVE_N_O_350x495.png','2026-03-09 00:22:18','2026-03-09 00:22:18',0),(4,'HOPPERS COMBO','Chiếc ly lấy cảm hứng từ siêu phẩm hoạt hình mới nhất, vui nhộn nhất của nhà DISNEY/ PIXAR – HOPPERS, chính thức ra mắt tại CGV!\n\n- Thiết kế ly 2 lớp trong suốt độc đáo, nổi bật với tone vàng cực bắt mắt.\n\n- Phần nắp cầu trong suốt kèm figure nhân vật Mable dễ thương sống động\n\n- Phần đế ly có thêm nhân vật Thằn lằn Tom bên trong, tạo hình 3D cực xịn.\n\n- Dung tích: 16oz\n\n- Chất liệu: Nhựa PP bền, nhẹ, không BPA an toàn khi sử dụng thực phẩm, nắp kín kèm ống hút.\n\n\nThông tin sản phẩm:\n\nMở bán từ ngày 06/03/2026 - Online & Offline tại các cụm rạp CGV trên toàn quốc.\n\n\nHOPPERS COMBO – 259.000Đ\n\n01 Ly Hoppers\n\n01 Bắp ngọt & 01 Coca-Cola\n\n\nHOPPERS FAMILY COMBO – 499.000Đ\n\n02 Ly Hoppers\n\n02 Bắp ngọt & 02 Coca-Cola\n\n\nMua trực tiếp tại rạp hoặc đặt mua tại CGV Store/ mua cùng lúc với vé online trên ứng dụng CGV Cinemas.','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/HOPPERS_N_O_350x495.jpg','2026-03-09 00:22:56','2026-03-09 00:22:56',0),(5,'CÙNG FUZE TEA BẮT TRỌN TỪNG KHOẢNH KHẮC','1. NỘI DUNG CHƯƠNG TRÌNH\n\n- Khách hàng mua từ 01 Combo bắp nước bất kì từ 149.000Đ bao gòm 01 Fuzetea 22Oz, nhận ngay 01 lượt chụp/in ảnh tại photobooth CGV de Photo\n\n\n2. THỜI GIAN DIỄN RA CHƯƠNG TRÌNH:\n\n- Áp dụng cho các giao dịch được thực hiện từ 18/07/2025 – cho đến khi có thông báo mới\n\n\n3. ĐỊA ĐIỂM ÁP DỤNG:\n\nÁp dụng cho các cụm rạp:\n\n- CGV Vivo City\n\n\n4. ĐIỀU KIỆN VÀ ĐIỀU KHOẢN:\n\n- Áp dụng cho khách hàng mua từ 01 Combo bắp nước bất kì từ 149.000Đ bao gòm 01 Fuzetea 22Oz\n\n- Áp dụng cho các giao dịch được thực hiện từ 18/07/2025 – cho đến khi có thông báo mới.\n\n- Khách hàng nhận lượt chụp hoặc in ảnh tại thời điểm hoàn thành giao dịch mua bắp nước. Coupon có giá trị trong ngày.\n\n- Được áp dụng tích luỹ trong cùng 1 giao dịch, ví dụ mua 01 Combo bắp nước bất kì từ 149.000Đ bao gồm 01 Fuzetea 22Oz nhận được 01 lượt chụp/in, 02 Combo bắp nước bất kì từ 149.000Đ bao gồm 01 Fuzetea 22Oz nhận được 02 lượt chụp/in,... .Không được gộp vé để áp dụng chương trình.\n\n- Mỗi giao dịch hợp lệ chỉ được áp dụng nhận quà 1 lần.\n\n- Không giới hạn số lượt tham gia của khách hàng nếu khách có giao dịch thoả điều kiện.\n\n- Số lượng phần quà có hạn, chương trình có thể kết thúc trước thời hạn nếu đã hết số lượng quà tặng.\n\n\n5. KHÔNG ÁP DỤNG:\n\n- CGVian, CJ Membership.\n\n- Sử dụng điểm thưởng CGV quy đổi thành vé 0Đ.\n\n- Không áp dụng đồng thời các CTKM khác.\n\n\n6. HƯỚNG DẪN SỬ DỤNG COUPON THANH TOÁN TẠI PHOTOBOOTH – CGV de Photo.\n\nTại màn hình thanh toán:\n\n- Chọn hình thức thanh toán: Coupon\n\n- Nhập mã/ Scan số Coupon bên dưới\n\n- Chọn Thanh toán và tiếp tục chụp/in hình','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/072025/2025_PTB_Fuze_Tea_AW_N_O_350x495.png','2026-03-09 00:24:09','2026-03-09 00:24:09',0),(6,'BẮP LẮC MASITA','1. Thời gian mở bán: Từ ngày 15.03.2025.\n\n\n2. Thông tin sản phẩm:\n\n\nLần đầu tiên tại CGV, sự kết hợp hoàn toàn mới giữa bắp thơm lừng và snack_Combo nhân đôi sự giòn tan chắc chắn sẽ khiến các tín đồ ăn vặt không thể bỏ lỡ.\n\n\n3. Danh sách cụm rạp mở bán: Sản phẩm được bán tại các cụm rạp trên toàn quốc.\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/032025/Masita_N_O_350x495.png','2026-03-09 00:24:55','2026-03-09 00:24:55',0);
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `password_resets_email_idx` (`email`),
  KEY `password_resets_token_idx` (`token`),
  KEY `password_resets_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('food','drink','combo','voucher') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Bắp rang bơ','food','Bắp rang bơ size M',50000.00,'https://th.bing.com/th/id/OIP.PB0IdzyOVT0mIuaAOtILaAHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0),(2,'Coca Cola','drink','Nước ngọt Coca 22oz',30000.00,'https://th.bing.com/th/id/OIP.rqYa_H1QuL_A0mH-jRbWaQHaHa?w=158&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0),(3,'Combo Couple','combo','Bắp + 2 nước',90000.00,'https://th.bing.com/th/id/OIP.EUQdTNofOTzR0Wsr8ZPVugHaIB?w=168&h=182&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `promotion_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('percentage','fixed_amount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `usage_limit` int unsigned DEFAULT NULL,
  `usage_count` int unsigned NOT NULL DEFAULT '0',
  `usage_per_user` int unsigned NOT NULL DEFAULT '1',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `applicable_days` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applicable_movies` text COLLATE utf8mb4_unicode_ci,
  `applicable_cinemas` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotions_promotion_code_key` (`promotion_code`),
  KEY `idx_promotion_code` (`promotion_code`),
  KEY `idx_promotion_status` (`status`),
  KEY `idx_promotion_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'CGV08032026','Khuyến mại gày 8/3','Nhân ngày 8/3 hệ thống tặng mã giảm giá 20%','percentage',20.00,40000.00,0.00,10,0,1,'2026-03-07 17:01:00','2026-03-15 16:59:00','0,6,3,2,1,4,5',NULL,NULL,'active','https://th.bing.com/th/id/OIP.7kc5p4BCZKdq65yiZ0-cWAHaHa?w=181&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 00:09:40',NULL,0),(2,'CGV8386','Khuyến mại','khuyến mại','percentage',10.00,19999.98,0.00,5,0,1,'2026-02-13 00:11:00','2026-03-06 00:11:00','1,2,3,4,5,6,0',NULL,NULL,'expired',NULL,'2026-03-09 00:11:38','2026-03-09 00:11:38',0);
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotionusage`
--

DROP TABLE IF EXISTS `promotionusage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotionusage` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `promotion_id` int unsigned NOT NULL,
  `account_id` int unsigned NOT NULL,
  `tickets_id` int unsigned NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_promotion_usage_account` (`account_id`),
  KEY `idx_promotion_usage_promotion` (`promotion_id`),
  KEY `promotionusage_tickets_id_fkey` (`tickets_id`),
  CONSTRAINT `promotionusage_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `promotionusage_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `promotionusage_tickets_id_fkey` FOREIGN KEY (`tickets_id`) REFERENCES `tickets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotionusage`
--

LOCK TABLES `promotionusage` WRITE;
/*!40000 ALTER TABLE `promotionusage` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotionusage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `province_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'Hà Nội',0),(2,'Hải Phòng',0),(3,'Quảng Ninh',0),(4,'Bình Định',0),(5,'Hưng Yên',0),(6,'Lạng Sơn',0),(7,'Phú Thọ',0);
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `movie_id` int unsigned NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_id_2` (`account_id`,`movie_id`),
  KEY `idx_reviews_movie_id` (`movie_id`),
  KEY `idx_reviews_account_id` (`account_id`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `idx_reviews_status` (`status`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,3,10,5,'Phim rất hay nhá','approved','2026-03-09 00:42:31','2026-03-09 00:42:42',0),(3,3,9,4,'Cũng rất hay nha','rejected','2026-03-09 00:44:35','2026-03-09 00:44:47',1),(6,1,9,5,'WOW','approved','2026-03-09 01:02:21','2026-03-09 01:02:29',0);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cinema_id` int unsigned NOT NULL,
  `room_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_seats` int NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cinema_id` (`cinema_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'Phòng 1','Standard',12,'active',0),(2,1,'Phòng 2','VIP',16,'active',0),(3,2,'Phòng 1','Standard',25,'active',0),(4,2,'Phòng 2','VIP',10,'active',0),(5,8,'Phòng 1','Standard',18,'active',0);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seatlocks`
--

DROP TABLE IF EXISTS `seatlocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seatlocks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `seat_id` int unsigned NOT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_seat_lock` (`seat_id`),
  KEY `idx_seat_lock_seat` (`seat_id`),
  KEY `idx_seat_lock_user` (`user_id`),
  KEY `idx_seat_lock_session` (`session_id`),
  KEY `idx_seat_lock_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seatlocks`
--

LOCK TABLES `seatlocks` WRITE;
/*!40000 ALTER TABLE `seatlocks` DISABLE KEYS */;
INSERT INTO `seatlocks` VALUES (1,78,3,'payment_1773017698083_ukfgpnaia','2026-03-09 00:54:58','2026-03-09 01:14:58',0,'2026-03-09 00:54:58','2026-03-09 00:55:00'),(2,71,3,'payment_1773017954548_bebckba5v','2026-03-09 00:59:15','2026-03-09 01:19:15',0,'2026-03-09 00:59:15','2026-03-09 00:59:18'),(3,10,3,'payment_1773037878380_k9p59x26a','2026-03-09 06:31:19','2026-03-09 06:51:19',0,'2026-03-09 01:00:14','2026-03-09 06:31:21');
/*!40000 ALTER TABLE `seatlocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `room_id` int unsigned NOT NULL,
  `seat_row` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type_id` int unsigned NOT NULL,
  `status` enum('active','broken','booked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_id` (`room_id`,`seat_row`,`seat_number`),
  KEY `seat_type_id` (`seat_type_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `seats_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seattypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,'A',1,1,'active'),(2,1,'A',2,1,'active'),(3,1,'A',3,1,'active'),(4,1,'A',4,1,'active'),(5,1,'B',1,1,'active'),(6,1,'B',2,1,'active'),(7,1,'B',3,1,'active'),(8,1,'B',4,1,'active'),(9,1,'C',1,3,'active'),(10,1,'C',2,3,'booked'),(11,1,'C',3,3,'active'),(12,1,'C',4,3,'active'),(13,2,'A',1,2,'active'),(14,2,'A',2,2,'active'),(15,2,'A',3,2,'active'),(16,2,'A',4,2,'active'),(17,2,'B',1,2,'active'),(18,2,'B',2,2,'active'),(19,2,'B',3,2,'active'),(20,2,'B',4,2,'active'),(21,2,'C',1,2,'active'),(22,2,'C',2,2,'active'),(23,2,'C',3,2,'active'),(24,2,'C',4,2,'active'),(25,2,'D',1,3,'active'),(26,2,'D',2,3,'active'),(27,2,'D',3,3,'active'),(28,2,'D',4,3,'active'),(29,3,'A',1,1,'active'),(30,3,'A',2,1,'active'),(31,3,'A',3,1,'active'),(32,3,'B',1,1,'active'),(33,3,'B',2,1,'active'),(34,3,'B',3,1,'active'),(35,3,'C',1,2,'active'),(36,3,'C',2,2,'active'),(37,3,'C',3,2,'active'),(38,3,'D',1,3,'active'),(39,3,'D',2,3,'active'),(40,3,'D',3,3,'active'),(41,3,'A',4,1,'active'),(42,3,'A',5,1,'active'),(43,3,'B',4,1,'active'),(44,3,'B',5,1,'active'),(45,3,'C',4,2,'active'),(46,3,'C',5,2,'active'),(47,3,'D',4,3,'active'),(48,3,'D',5,3,'active'),(49,3,'E',1,1,'active'),(50,3,'E',2,1,'active'),(51,3,'E',3,1,'active'),(52,3,'E',4,1,'active'),(53,3,'E',5,1,'active'),(54,4,'A',1,2,'active'),(55,4,'A',2,2,'active'),(56,4,'A',3,2,'active'),(57,4,'A',4,2,'active'),(58,4,'A',5,2,'active'),(59,4,'B',1,2,'active'),(60,4,'B',2,2,'active'),(61,4,'B',3,2,'active'),(62,4,'B',4,2,'active'),(63,4,'B',5,2,'active'),(64,5,'A',1,1,'active'),(65,5,'A',2,1,'active'),(66,5,'A',3,1,'active'),(67,5,'B',1,1,'active'),(68,5,'B',2,1,'active'),(69,5,'B',3,1,'active'),(70,5,'C',1,1,'active'),(71,5,'C',2,1,'booked'),(72,5,'C',3,1,'active'),(73,5,'D',1,2,'active'),(74,5,'D',2,2,'active'),(75,5,'D',3,2,'active'),(76,5,'E',1,2,'active'),(77,5,'E',2,2,'active'),(78,5,'E',3,2,'booked'),(79,5,'F',1,2,'active'),(80,5,'F',2,2,'active'),(81,5,'F',3,2,'active');
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seattypes`
--

DROP TABLE IF EXISTS `seattypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seattypes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_multiplier` decimal(3,2) DEFAULT '1.00',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seattypes`
--

LOCK TABLES `seattypes` WRITE;
/*!40000 ALTER TABLE `seattypes` DISABLE KEYS */;
INSERT INTO `seattypes` VALUES (1,'Standard',1.00,'Ghế thường',0),(2,'VIP',1.20,'Ghế VIP',0),(3,'Couple',1.50,'Ghế đôi',0);
/*!40000 ALTER TABLE `seattypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting_system`
--

DROP TABLE IF EXISTS `setting_system`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting_system` (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_at` datetime DEFAULT NULL,
  `config_data` json NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting_system`
--

LOCK TABLES `setting_system` WRITE;
/*!40000 ALTER TABLE `setting_system` DISABLE KEYS */;
INSERT INTO `setting_system` VALUES (1,'2026-03-08 17:55:03','{\"weekdayPrice\": 80000, \"weekendPrice\": 120000}','ticket_price');
/*!40000 ALTER TABLE `setting_system` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slots`
--

DROP TABLE IF EXISTS `slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `slots` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `movie_id` int unsigned NOT NULL,
  `room_id` int unsigned DEFAULT NULL,
  `show_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `empty_seats` int NOT NULL,
  `create_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `slots_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `slots_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slots`
--

LOCK TABLES `slots` WRITE;
/*!40000 ALTER TABLE `slots` DISABLE KEYS */;
INSERT INTO `slots` VALUES (1,10,1,'2026-03-09 08:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:35:05',0),(2,10,1,'2026-03-09 10:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:35:34',0),(3,10,1,'2026-03-08 23:00:00','2026-03-08 23:01:00',80000.00,12,'2026-03-09 00:36:27',0),(4,10,1,'2026-03-09 09:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:37:09',0),(5,10,2,'2026-03-09 08:00:00','2026-03-09 16:59:00',80000.00,16,'2026-03-09 00:38:42',0),(6,10,2,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,16,'2026-03-09 00:39:16',0),(7,10,3,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,25,'2026-03-09 00:39:50',0),(8,10,3,'2026-03-09 13:00:00','2026-03-09 16:59:00',80000.00,25,'2026-03-09 00:40:21',0),(9,10,5,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:41:12',0),(10,10,5,'2026-03-09 13:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:41:43',0),(11,9,5,'2026-03-09 14:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:44:01',0);
/*!40000 ALTER TABLE `slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `slot_id` int unsigned NOT NULL,
  `tickets_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_data` text COLLATE utf8mb4_unicode_ci,
  `tickets_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('unpaid','paid','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `status` enum('pending','confirmed','cancelled','used') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `is_deleted` tinyint(1) DEFAULT '0',
  `promotion_id` int unsigned DEFAULT NULL,
  `promotion_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_code` (`tickets_code`),
  KEY `account_id` (`account_id`),
  KEY `slot_id` (`slot_id`),
  KEY `idx_tickets_promotion_id` (`promotion_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id`),
  CONSTRAINT `tickets_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,3,10,'CGV1773017700438497',NULL,NULL,'2026-03-09 00:55:00',146000.00,0.00,146000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(2,3,11,'CGV1773017957638259',NULL,NULL,'2026-03-09 00:59:18',80000.00,0.00,80000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(3,3,3,'CGV1773018015247750',NULL,NULL,'2026-03-09 01:00:15',120000.00,0.00,120000.00,'unpaid','cancelled','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(4,3,2,'CGV1773037880838228',NULL,NULL,'2026-03-09 06:31:21',120000.00,0.00,120000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticketsdetails`
--

DROP TABLE IF EXISTS `ticketsdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticketsdetails` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tickets_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `quantity` int unsigned NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `tickets_id` (`tickets_id`),
  CONSTRAINT `ticketsdetails_ibfk_1` FOREIGN KEY (`tickets_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `ticketsdetails_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketsdetails`
--

LOCK TABLES `ticketsdetails` WRITE;
/*!40000 ALTER TABLE `ticketsdetails` DISABLE KEYS */;
INSERT INTO `ticketsdetails` VALUES (1,1,1,1,50000.00,50000.00,0);
/*!40000 ALTER TABLE `ticketsdetails` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-12 20:39:34
