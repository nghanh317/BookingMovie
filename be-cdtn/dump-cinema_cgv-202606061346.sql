-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: cinema_cgv
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int unsigned NOT NULL DEFAULT '0',
  `history_points` int unsigned NOT NULL DEFAULT '0',
  `vip_level` enum('bronze','silver','gold','platinum') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bronze',
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'trongprovip1','$2b$10$ZNao9EdAa5mIU/ETH5h8zOfyblthvEanIvbO2S/Iv6TFD3sx51xGu','duongtrong1306@gmail.com','0972199914','trongprovip',NULL,'user',0,0,'bronze','2026-03-08 17:55:24',NULL,1),(2,'admin','$2b$10$2fTZd5F/kKnrBRjvvkHIHucZr8kuuOwJ4HTYq3Vxm4a5meA8ASsj2','admin@cgv.com','0987654321','admin',NULL,'admin',0,0,'bronze','2026-03-08 17:55:50',NULL,0),(3,'trongahaha','$2b$10$.5GooyJVB2tD287MJJjtK.YnkhVfSe9t7vRzwBgZ1GpKpypSNvC1C','duongtrong13062004@gmail.com','0987654322','trongahihi','/avatars/user_3_1773017888135.jpg','user',0,0,'bronze','2026-03-08 17:56:29','2026-03-09 00:58:08',1),(5,'test','$2a$10$SEz1sd9tGf4l6keVGLnjW.tDh.xnKEUI5d07xcofW3XlXEfE54H5S','hanh11236ng@gmail.com','0123456789','Nguyễn Thị Hạnh',NULL,'user',0,200,'bronze','2026-05-13 13:44:20',NULL,0),(9,'test123','$2a$10$JyMpNKMUmMckeX2o/HtaQOwlDI2/B01pHJ6LbMIwdZ.4WRoWOK4ZK','test123@gmail.com','0123456789','Nguyễn Văn B',NULL,'user',0,0,'bronze','2026-05-18 10:33:51',NULL,1),(13,'test1234','$2a$10$E3580Jf1oZeMYlEv1dHgvuDSMuCOs1Z8ISugtPxUSRjed6BZrjGqy','test1234@gmail.com','0123456789','Nguyễn Văn C',NULL,'user',0,0,'bronze','2026-05-19 12:19:55',NULL,0),(14,'nvd','$2a$10$jyAYDSZjqkl.5KLLhkSVaOqSk95h8y9NOJDTOKbrVHP4CdgE63vae','nvd@gmail.com','0987654421','Nguyễn Văn D',NULL,'user',0,0,'bronze','2026-05-19 12:21:45',NULL,0),(15,'testuser1','$2a$10$6fxar0MXDlp4bA0Sbi7HjuAFYT6OTVCKj/8CilHqzzbydJIQoDjSK','test1@test.com','123456781','Test',NULL,'user',0,0,'bronze','2026-05-28 20:23:27',NULL,0),(16,'nguyenvana','$2b$10$ZNao9...','vana@gmail.com','0901000001','Nguyễn Văn A',NULL,'user',150,0,'bronze','2026-03-10 08:00:00',NULL,0),(17,'tranthib','$2b$10$ZNao9...','thib@gmail.com','0901000002','Trần Thị B',NULL,'user',300,0,'silver','2026-03-10 08:15:00',NULL,0),(18,'leminhc','$2b$10$ZNao9...','minhc@gmail.com','0901000003','Lê Minh C',NULL,'user',0,0,'bronze','2026-03-10 08:30:00',NULL,0),(19,'phamhoangd','$2b$10$ZNao9...','hoangd@gmail.com','0901000004','Phạm Hoàng D',NULL,'user',500,0,'gold','2026-03-10 09:00:00',NULL,0),(20,'vuongthie','$2b$10$ZNao9...','thie@gmail.com','0901000005','Vương Thị E',NULL,'user',100,0,'bronze','2026-03-10 09:20:00',NULL,0),(21,'hoangvanf','$2b$10$ZNao9...','vanf@gmail.com','0901000006','Hoàng Văn F',NULL,'user',200,0,'silver','2026-03-10 09:45:00',NULL,0),(22,'dangthig','$2b$10$ZNao9...','thig@gmail.com','0901000007','Đặng Thị G',NULL,'user',0,0,'bronze','2026-03-11 10:00:00',NULL,0),(23,'buiminhh','$2b$10$ZNao9...','minhh@gmail.com','0901000008','Bùi Minh H',NULL,'user',50,0,'bronze','2026-03-11 10:15:00',NULL,0),(24,'daothik','$2b$10$ZNao9...','thik@gmail.com','0901000009','Đào Thị K',NULL,'user',120,0,'bronze','2026-03-11 10:30:00',NULL,0),(25,'lythuyl','$2b$10$ZNao9...','thuyl@gmail.com','0901000010','Lý Thủy L',NULL,'user',400,0,'gold','2026-03-11 11:00:00',NULL,0),(26,'nguyenvanm','$2b$10$ZNao9...','vanm@gmail.com','0901000011','Nguyễn Văn M',NULL,'user',0,0,'bronze','2026-03-11 14:00:00',NULL,0),(27,'tranthio','$2b$10$ZNao9...','thio@gmail.com','0901000012','Trần Thị O',NULL,'user',10,0,'bronze','2026-03-11 14:30:00',NULL,0),(28,'lequocp','$2b$10$ZNao9...','quocp@gmail.com','0901000013','Lê Quốc P',NULL,'user',700,0,'platinum','2026-03-12 08:00:00',NULL,0),(29,'phamthiq','$2b$10$ZNao9...','thiq@gmail.com','0901000014333','Phạm Thị Q',NULL,'user',80,0,'bronze','2026-03-12 09:00:00',NULL,1),(30,'vuongvanr','$2b$10$ZNao9...','vanr@gmawil.comw','0901000015','Vương Văn R',NULL,'user',0,0,'bronze','2026-03-12 09:15:00',NULL,0),(31,'hoangthis','$2b$10$ZNao9...','this@gmail.com','0901000016','Hoàng Thị S',NULL,'user',350,0,'silver','2026-03-12 10:00:00',NULL,0),(32,'dangvant','$2b$10$ZNao9...','vant@gmail.com','0901000017','Đặng Văn T',NULL,'user',0,0,'bronze','2026-03-12 10:30:00',NULL,0),(33,'buithiu','$2b$10$ZNao9...','thiu@gmail.com','0901000018','Bùi Thị U',NULL,'user',90,0,'bronze','2026-03-12 11:00:00',NULL,0),(34,'daovanv','$2b$10$ZNao9...','vanv@gmail.com','0901000019','Đào Văn V',NULL,'user',250,0,'silver','2026-03-12 13:00:00',NULL,0),(35,'lythix','$2b$10$ZNao9...','thix@gmail.com','0901000020','Lý Thị X',NULL,'user',0,0,'bronze','2026-03-12 14:00:00',NULL,0),(36,'test12345','$2a$10$QBfX0o6/MMdo0xYigWggyegFDvsoHdMMTIj6.HQvH5wtt5T/Ik.bK','test12344@gmail.com','0123456789','Nguyễn Văn C',NULL,'user',0,0,'bronze','2026-05-31 15:32:36',NULL,0),(38,'nvabcd','$2a$10$7pwfu.pxEh1yt/ouOCAZ9Oe5oN4k/STA04WJVUVS.Sy2eiAZJlLzq','ABCD@gmail.com','0987654321','Nguyễn Văn ABCD',NULL,'user',0,0,'bronze','2026-05-31 21:33:13',NULL,0);
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
  UNIQUE KEY `UK3y8el5tqjsq4cx4afuqb6ajjs` (`tickets_id`,`seat_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `bookingseats_ibfk_1` FOREIGN KEY (`tickets_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `bookingseats_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookingseats`
--

LOCK TABLES `bookingseats` WRITE;
/*!40000 ALTER TABLE `bookingseats` DISABLE KEYS */;
INSERT INTO `bookingseats` VALUES (1,1,78,96000.00,0),(2,2,71,80000.00,0),(3,3,10,120000.00,0),(4,4,10,120000.00,0),(5,5,101,120000.00,0),(6,5,102,120000.00,0),(7,6,103,120000.00,0),(8,6,104,120000.00,0),(9,7,105,120000.00,0),(10,8,106,120000.00,0),(11,9,107,120000.00,0),(12,10,108,120000.00,0),(13,11,109,120000.00,0),(14,12,110,120000.00,0),(15,13,111,120000.00,0),(16,14,112,120000.00,0),(17,15,168,80000.00,0),(18,16,147,80000.00,0),(19,17,169,80000.00,0),(20,18,180,96000.00,0),(21,19,1,80000.00,0),(22,20,2,80000.00,0),(23,21,3,80000.00,0),(24,22,83,80000.00,0),(25,23,94,80000.00,0),(26,24,93,80000.00,0),(27,25,98,120000.00,0),(28,26,127,120000.00,0),(29,27,119,80000.00,0),(30,28,84,80000.00,0),(31,100,1,80000.00,0),(32,101,2,80000.00,0),(33,101,3,80000.00,0),(34,102,9,120000.00,0),(35,115,5,80000.00,1),(36,103,13,96000.00,0),(37,104,14,96000.00,0),(38,104,15,96000.00,0),(39,105,25,120000.00,0),(40,116,17,96000.00,0),(41,106,29,80000.00,0),(42,107,35,96000.00,0),(43,108,38,120000.00,0),(44,117,45,96000.00,0),(45,109,54,96000.00,0),(46,110,55,96000.00,0),(47,111,56,96000.00,0),(48,118,60,96000.00,0),(49,112,64,80000.00,0),(50,113,65,80000.00,0),(51,114,66,80000.00,0),(52,119,72,80000.00,0),(53,120,1,120000.00,1),(54,120,2,120000.00,1),(55,121,188,144000.00,1),(56,122,204,144000.00,1),(57,123,208,144000.00,1),(58,124,230,180000.00,1),(59,125,127,180000.00,1),(60,126,130,180000.00,1),(61,127,120,120000.00,0),(62,128,118,120000.00,0),(63,129,111,120000.00,0),(64,130,116,120000.00,0),(65,131,115,120000.00,0),(66,132,113,120000.00,1),(67,133,94,120000.00,0),(68,134,114,120000.00,0),(69,135,117,120000.00,0),(70,136,105,120000.00,0),(71,137,106,120000.00,1),(72,138,124,180000.00,1),(73,139,112,120000.00,1),(74,140,90,120000.00,1),(75,141,94,120000.00,0),(76,142,268,120000.00,0),(77,142,269,120000.00,0),(78,143,94,120000.00,0),(79,144,89,120000.00,0),(80,145,97,180000.00,0),(81,146,92,120000.00,0),(82,147,402,120000.00,0),(83,147,403,120000.00,0),(84,148,385,96000.00,1),(85,149,343,80000.00,1),(86,150,401,120000.00,1),(87,151,401,120000.00,1),(88,152,381,96000.00,0),(89,153,357,96000.00,0),(90,154,401,120000.00,1),(91,155,380,96000.00,1),(92,156,331,80000.00,1),(93,157,380,96000.00,1),(94,158,358,96000.00,0),(95,159,345,80000.00,0),(96,160,324,80000.00,1),(97,161,340,80000.00,1),(98,162,376,96000.00,0),(99,163,339,80000.00,0),(100,164,334,80000.00,0),(101,164,335,80000.00,0),(102,165,367,96000.00,0),(103,166,340,80000.00,1),(104,167,342,80000.00,0),(105,168,346,80000.00,1),(106,169,405,120000.00,1),(107,170,341,80000.00,1),(108,171,343,80000.00,0),(109,172,346,80000.00,0),(110,172,347,80000.00,0),(111,172,348,80000.00,0),(112,173,346,80000.00,1),(113,174,324,80000.00,0),(114,174,344,80000.00,0),(115,175,363,96000.00,1),(116,176,396,120000.00,0),(117,177,400,120000.00,0),(118,177,401,120000.00,0),(119,178,365,96000.00,0),(120,178,385,96000.00,0),(121,178,405,120000.00,0),(122,179,365,96000.00,0),(123,180,365,96000.00,0),(124,181,408,120000.00,0),(125,182,404,120000.00,1),(126,182,405,120000.00,1),(127,182,406,120000.00,1),(128,182,407,120000.00,1),(129,182,408,120000.00,1),(130,183,404,120000.00,1),(131,183,405,120000.00,1),(132,183,406,120000.00,1),(133,183,407,120000.00,1),(134,183,408,120000.00,1),(135,184,404,120000.00,1),(136,184,405,120000.00,1),(137,184,406,120000.00,1),(138,184,407,120000.00,1),(139,184,408,120000.00,1),(140,185,384,96000.00,1),(141,185,385,96000.00,1),(142,185,386,96000.00,1),(143,185,387,96000.00,1),(144,185,388,96000.00,1),(145,185,404,120000.00,1),(146,185,405,120000.00,1),(147,185,406,120000.00,1),(148,185,407,120000.00,1),(149,185,408,120000.00,1),(150,186,270,120000.00,1),(151,187,230,120000.00,1),(152,187,229,120000.00,1),(153,187,270,120000.00,1),(154,187,269,120000.00,1),(155,188,220,120000.00,0),(156,188,230,120000.00,0),(157,188,270,120000.00,0),(158,189,382,96000.00,1),(159,189,383,96000.00,1),(160,189,384,96000.00,1),(161,189,385,96000.00,1),(162,189,386,96000.00,1),(163,189,387,96000.00,1),(164,189,388,96000.00,1),(165,190,406,112500.00,1),(166,190,407,112500.00,1),(167,190,408,112500.00,1),(168,191,386,90000.00,1),(169,191,387,90000.00,1),(170,191,388,90000.00,1),(171,192,403,112500.00,1),(172,193,407,112500.00,1),(173,194,408,112500.00,1),(174,195,404,112500.00,1),(175,196,337,75000.00,1),(176,197,402,112500.00,1),(177,198,391,112500.00,1),(178,198,392,112500.00,1),(179,198,393,112500.00,1),(180,198,394,112500.00,1),(181,199,380,90000.00,1),(182,199,381,90000.00,1),(183,199,382,90000.00,1),(184,199,379,90000.00,1),(185,200,276,75000.00,0),(186,201,408,112500.00,1);
/*!40000 ALTER TABLE `bookingseats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int unsigned NOT NULL,
  `sender_role` enum('user','bot','agent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL COMMENT 'Lưu trữ payload JSON mở rộng cho giao diện Chat',
  `related_movie_id` int unsigned DEFAULT NULL COMMENT 'ID phim nếu nội dung chat đang tư vấn về 1 bộ phim cụ thể',
  `related_tickets_id` int unsigned DEFAULT NULL COMMENT 'ID vé nếu user đang hỏi/khiếu nại về 1 mã vé cụ thể',
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_session_id` (`session_id`),
  KEY `idx_chat_messages_movie` (`related_movie_id`),
  KEY `idx_chat_messages_tickets` (`related_tickets_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`related_movie_id`) REFERENCES `movies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`related_tickets_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'New Conversation',
  `status` enum('active','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_chat_sessions_account_id` (`account_id`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema_reviews`
--

DROP TABLE IF EXISTS `cinema_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema_reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `cinema_id` int unsigned NOT NULL,
  `rating` double NOT NULL,
  `comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_cinema_unique` (`account_id`,`cinema_id`),
  KEY `idx_reviews_cinema_id` (`cinema_id`),
  KEY `idx_reviews_account_id` (`account_id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `cinema_reviews_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cinema_reviews_ibfk_2` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_reviews`
--

LOCK TABLES `cinema_reviews` WRITE;
/*!40000 ALTER TABLE `cinema_reviews` DISABLE KEYS */;
INSERT INTO `cinema_reviews` VALUES (1,16,1,5,'Rạp Vincom Bà Triệu sạch sẽ, nhân viên nhiệt tình.','2026-03-12 20:05:00',NULL,0),(2,20,2,4,'Âm thanh phòng VIP ở Hồ Gươm Plaza rất tốt, màn hình sáng.','2026-03-13 10:05:00',NULL,0),(3,23,3,5,'Không gian rộng rãi, nhiều chỗ check-in đẹp.','2026-03-13 12:35:00',NULL,0),(4,26,2,3,'Giá vé hợp lý nhưng bãi gửi xe hơi xa.','2026-03-13 14:05:00',NULL,0);
/*!40000 ALTER TABLE `cinema_reviews` ENABLE KEYS */;
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
  `cinema_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `cinemas_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinemas`
--

LOCK TABLES `cinemas` WRITE;
/*!40000 ALTER TABLE `cinemas` DISABLE KEYS */;
INSERT INTO `cinemas` VALUES (1,1,'CGV Vincom Center Bà Triệu','191 Bà Triệu, Hà Nội',21.01118920,105.84947050,'active','0924783748','vincombt@gmail.com','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSws7VjBBM5bUJODwR6rhEZfcGbjQjkMKNhHg&s','2026-03-08 18:24:42',0),(2,1,'CGV Hồ Gươm Plaza','102-104 Đường Trần Phú - Hà Đông, Hà Nội',20.97461170,105.78084520,'active','0958345734','cgvhoguom@gmail.com','https://iguov8nhvyobj.vcdn.cloud/media/site/cache/3/980x415/b58515f018eb873dafa430b6f9ae0c1e/k/l/klg_4164.jpg','2026-03-08 18:25:33',0),(3,1,'CGV Aeon Long Biên','Long Biên , Hà Nội',21.03987130,105.85002160,'active','0953453453','aeonlongbien@gmail.com','https://iguov8nhvyobj.vcdn.cloud/media/site/cache/1/980x415/b58515f018eb873dafa430b6f9ae0c1e/p/o/popcorn_pactory_layer-1.jpg','2026-03-08 18:26:07',0),(4,2,'CGV Vincom Hải Phòng','Hùng Vương, Hải Phòng',20.87374710,106.63667080,'active','0973284727','vincomhp@gmail.com','https://iguov8nhvyobj.vcdn.cloud/media/site/cache/1/980x415/b58515f018eb873dafa430b6f9ae0c1e/c/g/cgv-vincom-haiphong-3.png','2026-03-08 18:27:24',0),(5,2,'CGV Aeon Mall Hải Phòng','Cầu Bính, Hải Phòng',20.87512870,106.66755580,'active','0947324234','aeonhp@gmail.com','https://chonthuonghieu.com/wp-content/uploads/listing-uploads/gallery/2021/02/cgv-aeon-mall-hai-phong-563077.jpg','2026-03-08 18:28:15',0),(6,3,'CGV Vincom Hạ Long','Lê Thánh Tông, Quảng Ninh',20.95158930,107.08576590,'active','0972446724','vincomhp@gmail.com','https://rapchieuphim.com/photos/2/cgv/cgv-vincom-ha-long-2.png','2026-03-08 18:29:36',0),(7,3,'CGV Vincom Cẩm Phả','Hồng Ngọc , Quảng Ninh',20.95016980,107.08250700,'active','0973647264','vincomcp@gmail.com','https://iguov8nhvyobj.vcdn.cloud/media/site/cache/1/980x415/b58515f018eb873dafa430b6f9ae0c1e/v/c/vc_cp1.jpg','2026-03-08 18:30:30',0),(8,4,'CGV Kim Cúc Plaza','Bình Định',NULL,NULL,'active','0983248728','kimcucplaza@gmail.com','https://rapchieuphim.com/photos/2/cgv/cgv-kim-cuc-plaza-1.png','2026-03-08 18:31:26',0),(9,5,'CGV Ecopark Hưng Yên','Hưng Yên',20.65893140,106.06198570,'active','0932462742','ecoparkhy@gmail.com',NULL,'2026-03-08 18:32:06',0),(10,6,'CGV Vincom Lạng Sơn','Lạng Sơn',21.85105360,106.76218120,'active','0967364724','vincomlangson@gmail.com',NULL,'2026-03-08 18:32:47',0),(11,8,'Lotte Bắc Ninh','Tầng 3, TTTM Vincom Bắc Ninh, Ngã 6, P.Suối Hoa, Bắc Ninh',NULL,NULL,'active','0924783748','lottebn@gmail.com','https://toplist.vn/images/800px/lotte-bac-ninh-1340509.jpg','2026-05-20 01:24:47',0),(12,1,'ư','abc',43.60909190,1.44393710,'active','0924783748','ww','','2026-05-31 21:15:57',1),(13,1,'ư','ư',54.57151800,-5.94374580,'active','eee','lottebn@gmail.com','','2026-05-31 21:16:43',1),(14,2,'e','e',52.53102140,-1.26490620,'active','1','ê','','2026-05-31 21:17:13',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,3,10,'2026-03-09 00:41:50',0),(2,3,9,'2026-03-09 00:43:21',0),(3,1,10,'2026-03-09 01:01:40',0),(4,1,8,'2026-03-09 01:01:43',0),(5,1,9,'2026-03-09 01:01:45',0),(6,16,1,'2026-03-11 08:00:00',0),(7,16,2,'2026-03-11 08:05:00',0),(8,17,5,'2026-03-11 09:00:00',0),(9,19,2,'2026-03-11 10:30:00',0),(10,20,4,'2026-03-12 11:00:00',0),(11,25,3,'2026-03-12 15:00:00',0),(12,29,5,'2026-03-12 17:30:00',0);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_reviews`
--

DROP TABLE IF EXISTS `movie_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int unsigned NOT NULL,
  `movie_id` int unsigned NOT NULL,
  `rating` double NOT NULL,
  `comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `ticket_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_movie_id` (`movie_id`),
  KEY `idx_reviews_account_id` (`account_id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `movie_reviews_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `movie_reviews_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_reviews`
--

LOCK TABLES `movie_reviews` WRITE;
/*!40000 ALTER TABLE `movie_reviews` DISABLE KEYS */;
INSERT INTO `movie_reviews` VALUES (2,3,10,5,'Phim rất hay nhá','2026-03-09 00:42:31','2026-03-09 00:42:42',0,NULL),(3,3,9,4,'Cũng rất hay nha','2026-03-09 00:44:35','2026-03-09 00:44:47',1,NULL),(6,1,9,5,'WOW','2026-03-09 01:02:21','2026-03-09 01:02:29',0,NULL),(7,16,1,5,'Phim bom tấn quá đỉnh, kỹ xảo xuất sắc!','2026-03-12 20:00:00',NULL,0,NULL),(8,17,1,4,'Đoạn cuối hơi buồn nhưng tổng thể rất hay.','2026-03-12 21:00:00',NULL,0,NULL),(9,19,2,5,'Spider-Man phần này plot twist không thể ngờ tới.','2026-03-13 10:00:00',NULL,0,NULL),(10,23,3,5,'Doraemon lúc nào cũng mang lại tuổi thơ dữ dội.','2026-03-13 12:30:00',NULL,0,NULL),(11,26,4,3,'Hành động mãn nhãn nhưng cốt truyện hơi dễ đoán.','2026-03-13 14:00:00',NULL,0,NULL),(12,29,5,5,'Inside Out 2 thực sự chạm đến cảm xúc người xem.','2026-03-13 16:45:00',NULL,0,NULL),(13,5,9,5,'Phim rất hay, rất thích!!!','2026-05-29 21:04:19','2026-05-29 21:04:19',0,NULL),(17,5,9,5,'phim ok đó, thích hợp để di xem với ngy','2026-05-29 21:18:01','2026-05-29 21:18:01',0,20),(18,5,6,5,'Phim cực kỳ dễ thương và mang tính chữa lành! Kỹ xảo mượt mà, tạo hình các nhân vật rất đáng yêu, đặc biệt là biểu cảm của nhân vật chính. Cốt truyện tuy đơn giản nhưng mang lại nhiều tiếng cười, rất hợp để thư giãn sau những giờ ngồi code căng thẳng','2026-05-30 21:30:45','2026-05-30 21:30:45',0,131),(19,5,6,5,'Phim cực kỳ dễ thương và mang tính chữa lành! Kỹ xảo mượt mà, tạo hình các nhân vật rất đáng yêu, đặc biệt là biểu cảm của nhân vật chính. Cốt truyện tuy đơn giản nhưng mang lại nhiều tiếng cười, rất hợp để thư giãn sau những giờ ngồi code căng thẳng','2026-05-30 21:30:44','2026-05-30 21:30:45',0,131),(20,38,7,5,'Phim hay ','2026-06-01 11:06:19','2026-06-01 11:06:19',0,143),(21,5,3,5,'12grydhhgjd','2026-06-03 16:57:18','2026-06-03 16:57:18',0,NULL);
/*!40000 ALTER TABLE `movie_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moviecinemas`
--

DROP TABLE IF EXISTS `moviecinemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moviecinemas` (
  `cinema_id` int unsigned NOT NULL,
  `movie_id` int unsigned NOT NULL,
  PRIMARY KEY (`cinema_id`,`movie_id`),
  KEY `fk_movie_cinema_movie` (`movie_id`),
  CONSTRAINT `fk_movie_cinema_cinema` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`),
  CONSTRAINT `fk_movie_cinema_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration` int NOT NULL,
  `release_date` date DEFAULT NULL,
  `director` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cast` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `genre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poster_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trailer_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age_rating` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'Avengers: Endgame','Biệt đội Avengers tập hợp lần cuối để đảo ngược hậu quả từ cú búng tay của Thanos.',181,'2025-11-13','Anthony Russo, Joe Russo','','Action, Adventure, Sci-Fi','English','https://th.bing.com/th/id/OIP.AsVeA2uTH8DIHIezO_yDGAHaK-?w=119&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/embed/TcMBFSGVi1c','T13','now_showing','2026-03-09 00:57:25','2026-05-21 01:16:51',0),(2,'Spider-Man: No Way Home','Peter Parker phải đối mặt với hậu quả khi danh tính bị lộ và đa vũ trụ bị phá vỡ.',148,'2026-01-09','Jon Watts','Tom Holland, Zendaya, Benedict Cumberbatch','Action, Adventure, Fantasy','English','https://th.bing.com/th/id/OIP.jFWga73Vye9w2gQvqWJX6gHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=JfVOs4VSpmA&t=18s','P','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:04',0),(3,'Doraemon: Nobita and the Sky Utopia','Nobita và Doraemon phiêu lưu đến vương quốc trên bầu trời.',107,'2025-12-09','Takumi Doyama','Wasabi Mizuta, Megumi Ohara','Animation, Family, Fantasy','Japanese','https://th.bing.com/th/id/OIP.gvr7hO-OSR7Zbwf9-_w9RwHaHa?w=179&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=Ol6Z_QR-OH8','P','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:16',0),(4,'Godzilla x Kong: The New Empire','Godzilla và Kong đối đầu với mối đe dọa mới có thể hủy diệt thế giới.',115,'2026-02-12','Adam Wingard','Rebecca Hall, Brian Tyree Henry','Action, Sci-Fi','English','https://th.bing.com/th/id/OIP.OCOslhU1srFM_5vAPeUD5wHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://youtuhttps://www.youtube.com/watch?v=lV1OOlGwExM&t=17sbe.com/watch?v=example2','P','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:25',0),(5,'Inside Out 2','Những cảm xúc mới xuất hiện trong tâm trí của Riley khi cô bước vào tuổi teen.',96,'2026-02-12','Kelsey Mann','Amy Poehler, Phyllis Smith','Animation, Comedy, Family','English','https://th.bing.com/th/id/OIP.s01urkcK6XmX5n-wjk3xpgHaK-?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','https://www.youtube.com/watch?v=VWavstJydZU','P','now_showing','2026-03-09 00:57:25','2026-03-08 18:03:36',0),(6,'THỎ ƠI!!','Phim “Thỏ ơi!!” dự kiến công chiếu trong dịp Tết 2026, thuộc thể loại hài, tâm lý sở trường của Trấn Thành, mang màu sắc trẻ trung với dàn diễn viên mới, tiếp nối tinh thần đem đến cho khán giả những điều vui vẻ, hài hước vào dịp Tết Nguyên đán.',127,'2026-02-17','Trấn Thành','Pháo; Lyly; Trấn Thành; Pháp Kiều; Gil Lê; Cris Phan; Ali Hoàng Dương; BB Trần; Đinh Ngọc Diệp','Tâm Lý','Tiếng Việt - Phụ đề Tiếng Anh','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/t/o/to_poster_official_tiectet_3x4_fa.jpg','https://www.youtube.com/watch?v=aJOXdRSj91g','P','now_showing','2026-03-08 18:07:35',NULL,0),(7,'CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI','Cảm Ơn Người Đã Thức Cùng Tôi là một hành trình cảm xúc của những người trẻ đi tìm đáp án cho câu hỏi “Ước mơ của bạn là gì?”, để rồi chính họ khi bước vào thế giới trưởng thành dần nhận ra câu hỏi quan trọng nhất là “Mình muốn thực hiện ước mơ đó cùng ai?”',137,'2026-02-27','Chung Chí Công','Võ Phan Kim Khánh, Trần Doãn Hoàng, Nguyễn Hùng','Gia đình, Tình cảm','Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/m/a/main_condtct_cinema_low.jpg','https://www.youtube.com/watch?v=uf2oOeJ-Z3s&list=RDuf2oOeJ-Z3s&start_radio=1','P','now_showing','2026-03-08 18:08:43',NULL,0),(8,'BÁU VẬT TRỜI CHO','BÁU VẬT TRỜI CHO - bộ phim đa sắc cảm xúc, rực rỡ yêu thương, gắn kết gia đình Tết 2026. Ngọc (Phương Anh Đào) là mẹ đơn thân, có con nhờ thụ tinh nhân tạo từ tinh trùng hiến tặng. Trong chuyến đi biển để đổi gió và trốn chạy quá khứ, cô & Tô chạm mặt Hồng (Tuấn Trần) – chàng trai làng chài phóng khoáng, cũng chính là người góp phần tạo nên sự ra đời của Tô. Cuộc gặp gỡ tréo ngoe ấy kéo ba con người xa lạ vào hàng loạt tình huống dở khóc dở cười lẫn căng thẳng, khi mọi thứ bắt đầu vượt ngoài kế hoạch. Liệu người cha “trời cho” này là món quà bất ngờ của số phận, hay chỉ là một “trò chơi” oái oăm cuộc đời?',124,'2026-02-17','Lê Thanh Sơn','NSND Kim Xuân, Tuấn Trần, Phương Anh Đào, Võ Tấn Phát, Hưng Nguyễn, La Thành, Trung Dân, Khương Lê, Tạ Lâm, Quách Ngọc Ngoan, Chị Phiến, Thư Đan…','Gia đình, Hài, Tình cảm','Tiếng Việt - Phụ đề tiếng Anh','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470wx700h-bvtc_3.jpg','https://www.youtube.com/watch?v=dwfUi9SV5ss','P','now_showing','2026-03-08 18:10:04',NULL,0),(9,'KHÔNG CÒN CHÚNG TA','Jeong-won và Eun-ho yêu nhau chân thành và sâu đậm bằng những tất cả những gì họ có ở khoảng thời gian đẹp nhất của thanh xuân. Nhưng tình yêu của tuổi trẻ không tránh khỏi sự non nớt, bồng bột để rồi họ chọn rời xa nhau. Nhiều năm sau gặp lại, họ nhận ra: chính những tháng năm đã yêu và đã đau ấy đã giúp họ trưởng thành hơn, hiểu được tình yêu và biết cách yêu thương hơn. Chỉ tiếc rằng khi ấy, yêu thương này họ không dành cho nhau được nữa…',114,'2026-03-06','Kim Do-Young','Koo Kyo-hwan, Moon Ga-young, Suyeon Ji','Tâm Lý, Tình cảm','Tiếng Hàn – Phụ đề tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470x700-us.jpg','https://www.youtube.com/watch?v=DltytoKP7Rg','P','now_showing','2026-03-08 18:11:24',NULL,0),(10,'MÙI PHỞ','Câu chuyện về sự xung đột thế hệ và những va chạm giữa quan niệm cũ và lối sống hiện đại, xoay quanh món Phở - biểu tượng ẩm thực Việt. Đằng sau những mâu thuẫn và tranh cãi ấy, từng bí mật dần được hé lộ, mở ra hành trình tìm lại sự ấm áp của tình thân qua những tình tiết hài hước, dí dỏm và đầy duyên dáng.',111,'2026-02-17','Minh Beta','Xuan Hinh - Thu Trang - Thanh Thanh Hien - Quoc Tuan - Bao Nam - Ha Huong - Thanh Huong - Chu Manh Cuong - Tien Loc','Gia đình, Hài','Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/3/5/350x495-muipho.jpg','https://www.youtube.com/watch?v=7L5qkIkkcY8','P','now_showing','2026-03-08 18:12:54',NULL,0),(11,'TỘI PHẠM 101','Lấy bối cảnh thành phố Los Angeles đầy nắng và bụi đường, Tội Phạm 101 kể về một tên trộm nữ trang bí ẩn (Chris Hemsworth) với hàng loạt phi vụ táo bạo khiến cảnh sát phải đau đầu. Trong lúc chuẩn bị cho phi vụ lớn nhất của mình, hắn gặp gỡ một nữ nhân viên bảo hiểm (Halle Berry), người cũng đang vật lộn với những lựa chọn trong đời mình. Trong khi đó, một thanh tra (Mark Ruffalo) đã tìm ra quy luật trong chuỗi các vụ án và đang ráo riết truy đuổi tên trộm, khiến cuộc chơi trở nên căng thẳng hơn bao giờ hết. Khi phi vụ định mệnh đến gần, ranh giới giữa kẻ săn đuổi và con mồi dần trở nên mờ nhạt và cả ba buộc phải đối mặt với những lựa chọn khó khăn và không còn cơ hội để quay đầu lại. Bộ phim được chuyển thể từ tiểu thuyết ngắn nổi tiếng cùng tên của Don Winslow, do Bart Layton (tác giả của American Animals, The Imposter) viết kịch bản và đạo diễn. Dàn diễn viên có sự tham gia của Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh và Nick Nolte.',129,'2026-03-13','Bart Layton','Chris Hemsworth, Mark Ruffalo, Halle Berry, Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh, Nick Nolte','Hồi hộp, Tội phạm','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster-crime.jpg','https://www.youtube.com/watch?v=TxY9GfEEMOI&t=2s','P','coming_soon','2026-03-08 18:14:09',NULL,0),(12,'CÔ DÂU!','Một cách tiếp cận táo bạo, phá vỡ mọi khuôn mẫu đối với một trong những câu chuyện hấp dẫn nhất thế giới. Bộ phim theo chân Frankenstein cô đơn (do Chrisitian Bale thủ vai) lên đường đến Chicago những năm 1930 để tìm đến nhà khoa học Dr. Euphronious (Annette Bening – 5 lần đề cử Oscar thủ vai), với hy vọng bà có thể tạo ra một người bạn đồng hành cho mình. Cả hai hồi sinh một cô gái trẻ đã bị sát hại, và Cô Dâu (Buckley thủ vai) đã ra đời. Những gì xảy ra sau đó đã vượt xa mọi tưởng tượng của họ: những vụ giết người, sự chiếm hữu, một phong trào văn hóa hoang dại và cấp tiến cũng như mối tình ngoài vòng pháp luật đầy cuồng nhiệt và bùng nổ!',126,'2026-03-13','Maggie Gyllenhaal','Jake Gyllenhaal, Christian Bale, Jessie Buckley,…','Kinh Dị, Nhạc kịch, Tình cảm','Tiếng Anh – phụ đề tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/m/a/main_poster_co_dau_1_final.jpg','https://www.youtube.com/watch?v=HYIOdcSGON4','P','coming_soon','2026-03-08 18:15:36',NULL,0),(13,'TIẾNG THÉT 7','Sidney Evans (Neve Campbell), nạn nhân sống sót của một vụ thảm sát nhiều năm trước, giờ đang sống hạnh phúc cùng chồng và con gái ở một thị trấn khác thì tên sát nhân Ghostface mới lại xuất hiện. Những nỗi sợ hãi đen tối nhất của cô trở thành hiện thực khi con gái cô Tatum Evans (Isabel May) trở thành mục tiêu tiếp theo. Quyết tâm bảo vệ gia đình, Sidney buộc phải đối mặt với những kinh hoàng trong quá khứ để chấm dứt cuộc đổ máu một lần và mãi mãi.',144,'2026-03-20','Kevin Williamson','Neve Campbell, Isabel May, Mckenna Grace, Courteney Cox, etc.','Bí ẩn, Kinh Dị','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/s/c/sc7_burnposter_470x700.jpg','https://www.youtube.com/watch?v=4g8OciWNJn4','P','coming_soon','2026-03-08 18:18:35',NULL,0),(14,'THOÁT KHỎI TẬN THẾ','Ryland Grace một giáo viên khoa học nhận ra anh chính là hy vọng cuối cùng của Trái Đất. Nhiệm vụ của anh: cứu lấy Mặt Trời khỏi một sinh thể bí ẩn đang hút cạn năng lượng ánh sáng, đẩy cả hệ Mặt Trời vào bóng tối vĩnh viễn. Nếu thất bại, sự sống trên Trái Đất sẽ lụi tàn theo ánh sáng cuối cùng của mặt trời. Giữa không gian vũ trụ cô độc và áp lực của thời gian đang cạn dần, mọi phép tính, mọi quyết định của anh đều gánh trên vai số phận của toàn nhân loại. Nhưng trong hành trình tưởng chừng chỉ có một mình giữa khoảng không vô tận ấy, một tình bạn bất ngờ với một sinh vật ngoài hành tinh đã xuất hiện. Và có lẽ, để cứu Trái Đất, anh sẽ không phải chiến đấu một mình.',111,'2026-03-20','Phil Lord, Christopher Miller','Ryan Gosling, Liz Kingsman, Milana Vayntrub, Sandra Hüller','Khoa Học Viễn Tưởng, Phiêu Lưu','Tiếng Anh - Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/3/5/350x495-mary.jpg','https://www.youtube.com/embed/ZhyHDNbxfcY','P','coming_soon','2026-03-08 18:19:49','2026-05-21 01:21:15',0),(15,'CHÚNG SẼ ĐOẠT MẠNG','Đến từ New Line Cinema và Nocturna, CHÚNG SẼ ĐOẠT MẠNG (tựa gốc: THEY WILL KILL YOU) là một tác phẩm kinh dị - hành động - hài hước đẫm máu và đầy kịch tính xoay quanh cuộc chiến sống còn của một người phụ nữ tại tòa nhà xa hoa The Virgil - hang ổ của một giáo phái ma quỷ. Khi màn đêm buông xuống, những cạm bẫy được giăng ra, kẻ không thể sống sót sẽ trở thành vật tế tiếp theo. Một trận chiến chết chóc mãn nhãn cùng phong cách hài đen đầy mê hoặc sẽ sớm bắt đầu trên màn ảnh rộng.',136,'2026-03-27','Kirill Sokolov','Zazie Beetz, Myha’La, Paterson Joseph, Tom Felton, Heather Graham, Patricia Arquette,...','Hài, Hành Động, Kinh Dị','Tiếng Anh – Phụ đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/v/n/vn_twky_vert_main_2764x4096_intl.jpg','https://www.youtube.com/watch?v=N-_NK612uH8','P','coming_soon','2026-03-08 18:21:24',NULL,0),(16,'PHIM SHIN - CẬU BÉ BÚT CHÌ: QUẬY TUNG! VƯƠNG QUỐC NGUỆCH NGOẠC VÀ 4 DŨNG SĨ BẤT ỔN','Bộ phim xoay quanh một vương quốc lơ lửng mang tên Rakuga, tồn tại nhờ nguồn năng lượng đến từ những nét vẽ của con người. Nhưng khi thế giới loài người dần đánh mất sự sáng tạo, Rakuga đứng bên bờ sụp đổ. Giữa thời khắc hỗn loạn, Shin vô tình nắm giữ cây bút chì màu kỳ diệu – có thể biến mọi hình vẽ thành hiện thực. Từ những nét vẽ ngây ngô nhất, bốn “vị anh hùng bất ổn” ra đời, đồng hành cùng cậu trong chuyến phiêu lưu vừa hài hước vừa kịch tính. Khi ranh giới giữa tưởng tượng và thực tại bị xóa nhòa, Shin không chỉ chiến đấu để cứu một vương quốc, mà còn để bảo vệ điều quý giá nhất: khả năng mơ mộng và sáng tạo của trẻ em.',104,'2026-05-03','Masakazu Hashimoto',' Akiko Yajima Shin Yumiko Kobayashi, Miki Narahashi,Toshiyuki Morikawa','Hài, Hoạt hình, Gia đình','Tiếng Nhật - Phụ Đề Tiếng Việt','https://upload.wikimedia.org/wikipedia/en/8/8e/Rakuga_kingdom_poster.jpg','https://www.youtube.com/watch?v=-dTuXbxiNcc','P',NULL,'2026-05-13 15:24:07','2026-05-21 00:00:20',0),(17,'MORTAL KOMBAT: CUỘC CHIẾN SINH TỬ II (T18)','Hãng phim New Line Cinema, phần tiếp theo đầy kịch tính trong loạt phim bom tấn chuyển thể từ trò chơi điện tử đình đám – Mortal Kombat II – trở lại với tất cả sự tàn bạo vốn có. Lần này, những nhà vô địch được yêu thích – nay có sự góp mặt của chính Johnny Cage – sẽ đối đầu với nhau trong trận chiến đẫm máu, không khoan nhượng, nhằm đánh bại thế lực đen tối của Shao Kahn đang đe dọa đến sự tồn vong của Earthrealm và các chiến binh bảo vệ nó.',116,'2026-05-13',' Simon McQuoid',' Karl Urban, Adeline Rudolph, Jessica McNamee, Josh Lawson, Ludi Lin, Mehcad Brooks, Tati Gabrielle, Lewis Tan,..','Hành Động, Phiêu Lưu, Thần thoại',' Tiếng Anh - Phụ Đề Tiếng Việt','https://starlight.vn/Areas/Admin/Content/Fileuploads/images/POSTER2026/motal%20kombat.jpg','https://www.youtube.com/watch?v=_UYoxtVTKEI','P',NULL,'2026-05-13 15:39:07','2026-05-13 15:39:07',0),(18,'ĐỘI THÁM TỬ CỪU','Đội Thám Tử Cừu: Án Mạng Lúc Nửa Đêm, phim trinh thám mới nhất quy tụ dàn sao Hollywood bom tấn để cùng giải mã bí ẩn cái chết của một thợ chăn cừu. Khi George đột ngột bị sát hại tại trang trại, cảnh sát địa phương tỏ ra bất lực trong việc tìm hung thủ. Đàn cừu quyết định tự mình thực hiện cuộc điều tra, sử dụng những kiến thức đã học được để lật tẩy kẻ thủ ác và bảo vệ trang trại.',109,'2026-05-13',' Kyle Balda',' Hugh Jackman, Emma Thompson, Nicholas Braun, Nicholas Galitzine, Molly Gordon. Hong Chau, Tosin Cole, Kobna Holdbrook-Smith, Conleth Hill, Mandeep Dhillon, Bryan Cranston, Julia Louis-Dreyfus, Patrick Stewart','Hài, Hành động, Bí ẩn',' Tiếng Anh - Phụ Đề Tiếng Việt','https://dcine.vn/Areas/Admin/Content/Fileuploads/images/doithamtucuuPoster.jpg','https://www.youtube.com/watch?v=7wU_SB2HTaY','P',NULL,'2026-05-13 15:44:50','2026-05-13 15:44:50',0),(19,'MÈO SIÊU QUẬY Ở VIỆN BẢO TÀNG 2: ĐẠI NÁO KIM TỰ THÁP','Hai năm đã trôi qua kể từ khi bảo tàng Hermitage được giải cứu thành công, còn bức tranh Mona Lisa bị đánh cắp. Chú chuột Maurice vẫn luôn mơ mộng về những cuộc phiêu lưu mới, trong khi cặp đôi Vincent và Cleopatra đã có thêm hai chú mèo con hiếu động và cũng đang khao khát những chuyến hành trình đầy thú vị',90,'2026-05-13',' Vasiliy Rovenskiy',' Roman Kurtsyn, Snezhana Samokhina, Diomid Vinogradov,...','Hài, Hành động, Hoạt hình',' Tiếng Anh - Phụ Đề Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/p/o/poster_payoff_cats_in_the_museum.jpg','https://www.youtube.com/watch?v=gG5QWGk5ZF4','P',NULL,'2026-05-13 15:51:42','2026-05-13 15:51:42',0),(20,'THẨM MỸ VIỆN ÂM PHỦ','Bộ phim xoay quanh Thanh (Ngọc Trinh), một nữ bác sĩ trẻ dấn thân vào thẩm mỹ viện biệt lập và kỳ quái để tìm cách cứu người yêu đang hôn mê. Tại đây, cô được bà Xuân (Xuân Lan) - chủ cơ sở, dẫn dắt vào những ca phẫu thuật thay đổi diện mạo đầy bí ẩn và nhuốm màu tà thuật. Thanh dần phát hiện mình là vật hiến tế trong một nghi thức mang tên “đi thiếp”. Những hiện tượng siêu nhiên và cơn ác mộng liên tục xuất hiện, xóa nhòa ranh giới giữa sự sống và cái chết. Cô buộc phải đối mặt với thế lực hắc ám để giành lại quyền kiểm soát số phận của chính mình.',97,'2026-05-13','  Nguyễn Hữu Hoàng','','Kinh dị','Tiếng Việt','https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470wx700h-tmv.jpg','https://www.youtube.com/embed/puIIHiE8OOE','T18','now_showing','2026-05-13 16:03:22','2026-05-21 01:17:03',0),(21,'LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG','Lúc đó tôi đã chuyển sinh thành Slime: Nước Mắt Đại Dương là phần phim điện ảnh thứ 2 thuộc franchise anime nổi tiếng Lúc đó tôi đã chuyển sinh thành Slime. Lấy bối cảnh sau Lễ hội Khai quốc Tempest, Rimuru cùng những người bạn đồng hành quyết định ghé thăm một khu nghỉ dưỡng sang trọng do Elmesia, người đứng đầu Đế chế Pháp Thuật Sarion, cai quản, để tận hưởng thời gian thư giãn hiếm hoi sau những biến cố. Tuy nhiên, chuyến nghỉ dưỡng nhanh chóng bị xáo trộn khi nhân vật bí ẩn tên Yura xuất hiện, kéo theo một chuỗi những sự kiện bí ẩn và mối nguy đang âm thầm trỗi dậy dưới đại dương.',105,'2026-05-20','Yasuhito Kikuchi','Miho Okasaki, Mao Ichimichi, Tomoaki Maeno, Makoto Furukawa, Sayaka Senbongi','Hoạt Hình','Tiếng Nhật - Phụ đề Tiếng Việt','https://media.lottecinemavn.com/Media/MovieFile/MovieImg/202604/12179_203_100001.jpg','https://www.youtube.com/watch?v=Ixu8jbrhqnU','P',NULL,'2026-05-20 12:21:11','2026-05-20 12:21:11',0),(22,'LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG','Lúc đó tôi đã chuyển sinh thành Slime: Nước Mắt Đại Dương là phần phim điện ảnh thứ 2 thuộc franchise anime nổi tiếng Lúc đó tôi đã chuyển sinh thành Slime. Lấy bối cảnh sau Lễ hội Khai quốc Tempest, Rimuru cùng những người bạn đồng hành quyết định ghé thăm một khu nghỉ dưỡng sang trọng do Elmesia, người đứng đầu Đế chế Pháp Thuật Sarion, cai quản, để tận hưởng thời gian thư giãn hiếm hoi sau những biến cố. Tuy nhiên, chuyến nghỉ dưỡng nhanh chóng bị xáo trộn khi nhân vật bí ẩn tên Yura xuất hiện, kéo theo một chuỗi những sự kiện bí ẩn và mối nguy đang âm thầm trỗi dậy dưới đại dương.',105,'2026-05-20','Yasuhito Kikuchi','Miho Okasaki, Mao Ichimichi, Tomoaki Maeno, Makoto Furukawa, Sayaka Senbongi','Hoạt Hình','Tiếng Nhật - Phụ đề Tiếng Việt','https://media.lottecinemavn.com/Media/MovieFile/MovieImg/202604/12179_203_100001.jpg','https://www.youtube.com/watch?v=Ixu8jbrhqnU','P',NULL,'2026-05-20 14:54:21','2026-05-20 14:55:17',1),(23,'test them phim','anc',222,'2026-05-21','teest','abc','Gia đình','Tiếng Anh','','','T13','coming_soon','2026-05-21 21:32:14','2026-05-21 21:32:20',1),(24,'123','442tvgsdrwjkrh',11,'2026-05-23','124','2222e','Phiêu lưu','Tiếng Anh','ee','e','T13','coming_soon','2026-05-23 11:14:55','2026-05-23 11:15:06',1),(25,'123','1',11,'2026-05-25','12','11','Phiêu lưu','Tiếng Anh','','','T13','coming_soon','2026-05-25 11:02:08','2026-05-30 00:41:35',1),(26,'123','ê',133,'2026-05-31','1234','ê','Hành động','Tiếng Anh','','','T13','coming_soon','2026-05-31 15:29:05','2026-05-31 21:03:14',1),(27,'ww','eww',-103,'2026-05-31','ư','','Gia đình','Tiếng Anh','e','e','T13','coming_soon','2026-05-31 21:00:41','2026-06-01 10:46:01',1),(28,'','db',2,'2026-05-24','d','','Phiêu lưu','Tiếng Anh','','','T13','coming_soon','2026-05-31 21:07:14','2026-06-05 02:04:08',0),(29,'','',140,'2026-05-15','Chayanop Boonprakob - Baz Poonpiriya - Atta Hemwadee','','','Tiếng Việt','','','T13','coming_soon','2026-06-01 14:38:00','2026-06-04 11:24:43',1),(30,'1','',22,'2026-06-06','2','2','Tình cảm','Tiếng Anh','','','T13','coming_soon','2026-06-05 02:01:59','2026-06-05 02:03:42',1);
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
  `title` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Nhận mã giảm giá 20% nhân ngày mùng 8/3','Nhận mã giảm giá 20% nhân ngày mùng 8/3','https://th.bing.com/th/id/OIP.7kc5p4BCZKdq65yiZ0-cWAHaHa?w=181&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 00:20:34','2026-03-09 00:20:34',0),(2,'CHƯƠNG TRÌNH CÔ DÂU THE BRIDE & CHÚ RỂ FRANKENSTEIN TẶNG HOA NHÂN NGÀY QUỐC TẾ PHỤ NỮ 8/3','1. Thời gian và địa điểm áp dụng\n\n- Thời gian: 07/03/2026 – 08/03/2026\n\n- Khung giờ: 18:00 – 21:00\n\n- Địa điểm:\n\n+ TP. HCM: CGV Sư Vạn Hạnh\n\n+ HÀ NỘI: CGV Vincom Royal City\n\n\n2. Thời gian và địa điểm áp dụng\n\n- Trong khung giờ diễn ra chương trình, 02 người hóa trang thành nhân vật Cô Dâu và Frankenstein (hoặc nhân viên của đơn vị tổ chức) sẽ xuất hiện tại khu vực sảnh rạp để giao lưu và chụp hình cùng khách.\n\n- Người hóa trang sẽ phát ngẫu nhiên hoa hồng (được bọc trong giấy gói đen và có thẻ ghi chú thông tin về ngày khởi chiếu & QR code dẫn đến trailer phim) cho các khách hàng nữ có mặt tại sảnh rạp, nhằm hưởng ứng Ngày Quốc Tế Phụ Nữ 8/3.\n\n- Lưu ý: sự kiện có chụp ảnh/ghi hình.\n\n\n3. Cơ chế tham gia\n\n- Không yêu cầu mua vé.\n\n- Không yêu cầu xuất trình vé hoặc đăng ký trước.\n\n- Quà tặng được phát ngẫu nhiên cho khách (ưu tiên khách hàng nữ hoặc các nhóm có bạn nữ đi chung) có mặt tại sảnh trong thời gian chạy hoạt động.\n\n- Mỗi khách nhận tối đa 01 bông hoa, tùy theo số lượng quà thực tế.\n\n\n4. Trách nhiệm triển khai\n\n- Chương trình do đơn vị sản xuất/đối tác phụ trách tổ chức và vận hành.\n\n- Rạp chỉ hỗ trợ về mặt địa điểm theo phạm vi cho phép và phối hợp đảm bảo hoạt động không ảnh hưởng đến vận hành chung.\n\n- Rạp không chịu trách nhiệm phát quà hoặc xử lý khiếu nại liên quan đến quà tặng của chương trình.\n\n\n5. Lưu ý\n\n- Hoạt động chỉ diễn ra tại khu vực sảnh rạp và trong đúng khung giờ nêu trên.\n\n- Số lượng quà có hạn và có thể kết thúc sớm khi phát hết.\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/350x495_36_.jpg','2026-03-09 00:21:16','2026-03-09 00:21:16',0),(3,'SELF LOVE: YÊU MÌNH MỘT CHÚT!!!','Trong tháng 3 này, CGVxCoca-Cola mang đến một món quà với thông điệp yêu thương.\n\nSelf-love - không dành riêng cho ai, không cần lý do đặc biệt, chỉ đơn giản là:\n\nChọn bộ phim mình thích mà không cần chờ ai rủ.\n\nTự thưởng một combo bắp nước thật “đã”.\n\nTặng cho bản thân một món quà nhỏ nhưng đầy ý nghĩa.\n\n\nTẶNG TÚI TOTE “SELF LOVE”\n\nKhi mua hóa đơn bắp nước trị giá từ 219.000đ\n\n(bao gồm ít nhất 01 sản phẩm Coca-Cola)\n\n\n1. Áp dụng:  từ ngày 28/02/2026 đến 15/03/2026, tại tất cả các cụm rạp CGV trên toàn quốc.\n\n\n2. Điều kiện và điều khoản:\n\n- Chỉ áp dụng cho các giao dịch mua bắp nước trị giá từ 219.000đ, từ ngày 28/02/2026 đến hết ngày 15/03/2026\n\n- Hóa đơn mua bắp nước phải có ít nhất 01 sản phẩm Coca-cola thì hợp lệ\n\n- Không áp dụng cho giao dịch mua CGV TẾT BOTTLE COMBO – Bình Xuân Bính Ngọ\n\n- Áp dụng cho giao dịch online và offline tại tất cả cụm rạp CGV.\n\n- Khách hàng mua giao dịch tại rạp nào , nhận quà tặng tại rạp đó và nhận cùng thời điểm nhận bắp nước\n\n- Được áp dụng lũy tiến và áp dụng đồng thời với các chương trình khuyến mãi khác .\n\n- Không áp dụng tách hoặc gộp giá trị hóa đơn dưới mọi hình thức\n\n- Không áp dụng chương trình cho các hình thức thanh toán giao dịch bằng CGVian hoặc CJ Membership.\n\n- Số lượng quà tặng có giới hạn , chương trình có thể kết thúc sớm ngay khi hết hàng\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/SELF_LOVE_N_O_350x495.png','2026-03-09 00:22:18','2026-03-09 00:22:18',0),(4,'HOPPERS COMBO','Chiếc ly lấy cảm hứng từ siêu phẩm hoạt hình mới nhất, vui nhộn nhất của nhà DISNEY/ PIXAR – HOPPERS, chính thức ra mắt tại CGV!\n\n- Thiết kế ly 2 lớp trong suốt độc đáo, nổi bật với tone vàng cực bắt mắt.\n\n- Phần nắp cầu trong suốt kèm figure nhân vật Mable dễ thương sống động\n\n- Phần đế ly có thêm nhân vật Thằn lằn Tom bên trong, tạo hình 3D cực xịn.\n\n- Dung tích: 16oz\n\n- Chất liệu: Nhựa PP bền, nhẹ, không BPA an toàn khi sử dụng thực phẩm, nắp kín kèm ống hút.\n\n\nThông tin sản phẩm:\n\nMở bán từ ngày 06/03/2026 - Online & Offline tại các cụm rạp CGV trên toàn quốc.\n\n\nHOPPERS COMBO – 259.000Đ\n\n01 Ly Hoppers\n\n01 Bắp ngọt & 01 Coca-Cola\n\n\nHOPPERS FAMILY COMBO – 499.000Đ\n\n02 Ly Hoppers\n\n02 Bắp ngọt & 02 Coca-Cola\n\n\nMua trực tiếp tại rạp hoặc đặt mua tại CGV Store/ mua cùng lúc với vé online trên ứng dụng CGV Cinemas.','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2026/022026/HOPPERS_N_O_350x495.jpg','2026-03-09 00:22:56','2026-03-09 00:22:56',0),(5,'CÙNG FUZE TEA BẮT TRỌN TỪNG KHOẢNH KHẮC','1. NỘI DUNG CHƯƠNG TRÌNH\n\n- Khách hàng mua từ 01 Combo bắp nước bất kì từ 149.000Đ bao gòm 01 Fuzetea 22Oz, nhận ngay 01 lượt chụp/in ảnh tại photobooth CGV de Photo\n\n\n2. THỜI GIAN DIỄN RA CHƯƠNG TRÌNH:\n\n- Áp dụng cho các giao dịch được thực hiện từ 18/07/2025 – cho đến khi có thông báo mới\n\n\n3. ĐỊA ĐIỂM ÁP DỤNG:\n\nÁp dụng cho các cụm rạp:\n\n- CGV Vivo City\n\n\n4. ĐIỀU KIỆN VÀ ĐIỀU KHOẢN:\n\n- Áp dụng cho khách hàng mua từ 01 Combo bắp nước bất kì từ 149.000Đ bao gòm 01 Fuzetea 22Oz\n\n- Áp dụng cho các giao dịch được thực hiện từ 18/07/2025 – cho đến khi có thông báo mới.\n\n- Khách hàng nhận lượt chụp hoặc in ảnh tại thời điểm hoàn thành giao dịch mua bắp nước. Coupon có giá trị trong ngày.\n\n- Được áp dụng tích luỹ trong cùng 1 giao dịch, ví dụ mua 01 Combo bắp nước bất kì từ 149.000Đ bao gồm 01 Fuzetea 22Oz nhận được 01 lượt chụp/in, 02 Combo bắp nước bất kì từ 149.000Đ bao gồm 01 Fuzetea 22Oz nhận được 02 lượt chụp/in,... .Không được gộp vé để áp dụng chương trình.\n\n- Mỗi giao dịch hợp lệ chỉ được áp dụng nhận quà 1 lần.\n\n- Không giới hạn số lượt tham gia của khách hàng nếu khách có giao dịch thoả điều kiện.\n\n- Số lượng phần quà có hạn, chương trình có thể kết thúc trước thời hạn nếu đã hết số lượng quà tặng.\n\n\n5. KHÔNG ÁP DỤNG:\n\n- CGVian, CJ Membership.\n\n- Sử dụng điểm thưởng CGV quy đổi thành vé 0Đ.\n\n- Không áp dụng đồng thời các CTKM khác.\n\n\n6. HƯỚNG DẪN SỬ DỤNG COUPON THANH TOÁN TẠI PHOTOBOOTH – CGV de Photo.\n\nTại màn hình thanh toán:\n\n- Chọn hình thức thanh toán: Coupon\n\n- Nhập mã/ Scan số Coupon bên dưới\n\n- Chọn Thanh toán và tiếp tục chụp/in hình','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/072025/2025_PTB_Fuze_Tea_AW_N_O_350x495.png','2026-03-09 00:24:09','2026-03-09 00:24:09',0),(6,'BẮP LẮC MASITA','1. Thời gian mở bán: Từ ngày 15.03.2025.\n\n\n2. Thông tin sản phẩm:\n\n\nLần đầu tiên tại CGV, sự kết hợp hoàn toàn mới giữa bắp thơm lừng và snack_Combo nhân đôi sự giòn tan chắc chắn sẽ khiến các tín đồ ăn vặt không thể bỏ lỡ.\n\n\n3. Danh sách cụm rạp mở bán: Sản phẩm được bán tại các cụm rạp trên toàn quốc.\n\n','https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/032025/Masita_N_O_350x495.png','2026-03-09 00:24:55','2026-03-09 00:24:55',0),(7,'jhhdhdhdhjjj','1333','https://i1-kinhdoanh.vnecdn.net/2026/04/13/aeon-hue-1776048721-6182-1776048816.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=ohSnOTPvUrrYXPeymu51Ug','2026-05-23 11:18:46','2026-05-23 11:18:46',0),(8,'test tin tức','sss','https://i1-kinhdoanh.vnecdn.net/2026/04/13/aeon-hue-1776048721-6182-1776048816.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=ohSnOTPvUrrYXPeymu51Ug','2026-05-23 23:09:34','2026-05-23 23:09:34',0),(9,'test','1234567890','https://i1-kinhdoanh.vnecdn.net/2026/04/13/aeon-hue-1776048721-6182-1776048816.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=ohSnOTPvUrrYXPeymu51Ug','2026-05-23 23:15:33','2026-05-23 23:15:33',0),(10,'1222','123','https://www.bing.com/th/id/OIP.SWPK7Xf1HITPIPtNbrM6egHaEo?w=193&h=135&c=8&rs=1&qlt=90&o=6&dpr=2&pid=3.1&rm=2','2026-05-31 12:01:21','2026-05-31 12:01:21',0),(11,'Spider man','<span style=\"display:none\">[Review phim]</span>s','https://placehold.co/640x360/1a1a2e/e5b85c?text=CinemaBook','2026-05-31 12:07:41','2026-05-31 14:03:14',0),(12,'Piece, Naruto hay Doraemon không chỉ là những anime nổi tiếng mà còn trở thành một phần văn hóa Nhật Bản','<span style=\"display:none\">[Tin tức]</span>Doraemon, Dragon Ball và các tượng đài anime được dự đoán vẫn tồn tại sau 50 năm','https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA244Pn3.img?w=768&h=432&m=6','2026-05-31 12:43:12','2026-05-31 14:03:28',0),(13,'<span style=\"display:none\">[Khuyến mãi]</span>fdgshsswshhhttff','12455','https://i1-kinhdoanh.vnecdn.net/2026/04/13/aeon-hue-1776048721-6182-1776048816.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=ohSnOTPvUrrYXPeymu51Ug','2026-06-03 17:16:12','2026-06-03 17:16:12',0),(14,'<span style=\"display:none\">[Khuyến mãi]</span>11','11111','https://placehold.co/640x360/1a1a2e/e5b85c?text=CinemaBook','2026-06-03 17:20:57','2026-06-03 17:20:57',0),(15,'Phim “Mưa đỏ” đối đầu “Tử chiến trên không”','<span style=\"display:none\">[Tin tức]</span>Dân trí - Hai bộ phim Việt ăn khách nhất 2025 đến từ Điện ảnh Quân đội Nhân dân và Điện ảnh Công an Nhân dân, sẽ cùng tranh giải tại Liên hoan phim châu Á Đà Nẵng lần thứ IV (DANAFF IV).Thông tin được Ban tổ chức DANAFF IV công bố tại cuộc họp báo ngày 3/6.','https://cdnphoto.dantri.com.vn/9AjmNpjcX4L_QYFdFqEslSn4yrw=/thumb_w/1360/2026/06/03/steven-nguyen-cropped-1780499426440.jpg','2026-06-04 16:08:58','2026-06-04 16:14:02',0);
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
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `password_resets_email_idx` (`email`),
  KEY `password_resets_token_idx` (`token`),
  KEY `password_resets_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Bắp rang bơ','food','Bắp rang bơ size M',50000.00,'https://th.bing.com/th/id/OIP.PB0IdzyOVT0mIuaAOtILaAHaLH?w=115&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0),(2,'Coca Cola','drink','Nước ngọt Coca 22oz',30000.00,'https://th.bing.com/th/id/OIP.rqYa_H1QuL_A0mH-jRbWaQHaHa?w=158&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0),(3,'Combo Couple','combo','Bắp + 2 nước',90000.00,'https://th.bing.com/th/id/OIP.EUQdTNofOTzR0Wsr8ZPVugHaIB?w=168&h=182&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 01:04:57',0),(4,'coco','food','q211',300000.00,'gfgfff','2026-05-25 11:06:56',0);
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
  `promotion_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `usage_limit` int unsigned DEFAULT NULL,
  `usage_count` int unsigned NOT NULL DEFAULT '0',
  `usage_per_user` int unsigned NOT NULL DEFAULT '1',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `applicable_days` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applicable_movies` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applicable_cinemas` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `required_rank` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_points` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotions_promotion_code_key` (`promotion_code`),
  KEY `idx_promotion_code` (`promotion_code`),
  KEY `idx_promotion_status` (`status`),
  KEY `idx_promotion_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'CGV08032026','Khuyến mại gày 8/3','Nhân ngày 8/3 hệ thống tặng mã giảm giá 20%','percentage',20.00,40000.00,0.00,10,0,1,'2026-03-07 17:01:00','2026-03-15 16:59:00','0,6,3,2,1,4,5',NULL,NULL,'active','https://th.bing.com/th/id/OIP.7kc5p4BCZKdq65yiZ0-cWAHaHa?w=181&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3','2026-03-09 00:09:40',NULL,0,NULL,NULL),(2,'CGV8386','Khuyến mại','khuyến mại','percentage',10.00,19999.98,0.00,5,0,1,'2026-02-13 00:00:00','2026-03-06 00:00:00','1,2,3,4,5,6,0','','','inactive','','2026-03-09 00:11:38','2026-06-02 15:47:25',0,NULL,NULL),(3,'TEST123','test','C1Aoroor','percentage',20.00,25000.00,10000.00,24,0,1,'0027-11-16 00:00:00','0032-11-15 00:00:00','','','','inactive','','2026-05-22 08:57:03','2026-05-22 09:38:43',1,NULL,NULL),(4,'VOUCHER2020','test voucher','test','percentage',20.00,40000.00,10000.00,20,0,1,'0035-11-16 00:00:00','0035-12-17 00:00:00','','','','active','','2026-05-31 16:13:49','2026-06-02 18:20:44',1,NULL,NULL),(5,'A123','aaa','aa','percentage',20.00,0.00,0.00,100,0,1,'0036-11-15 00:00:00','0006-11-16 00:00:00','','','','active','','2026-05-31 17:39:31','2026-06-02 18:20:40',1,NULL,NULL),(7,'123','123','tt','fixed_amount',2000.00,0.00,5.00,5,0,15,'0007-12-17 00:00:00','0008-12-16 00:00:00','','','','active','t','2026-06-02 18:15:26','2026-06-02 18:20:33',1,NULL,NULL),(8,'12','12222','','percentage',33.00,3.00,3.00,3,0,1,'2026-06-02 00:00:00','2026-06-12 00:00:00','','','','active','','2026-06-02 18:20:26','2026-06-02 21:22:34',0,NULL,NULL),(9,'CDTN1234','CDTN','Chúc may mắn','percentage',50.00,100000.00,0.00,100,0,1,'2026-06-02 00:00:00','2026-06-30 00:00:00','','','','active','','2026-06-02 18:27:19','2026-06-02 18:27:19',0,NULL,NULL),(10,'VANG','test vàng','123','percentage',40.00,50000.00,0.00,20,0,1,'2026-06-02 00:00:00','2026-06-25 00:00:00','','','','active','111','2026-06-02 22:51:10','2026-06-02 22:51:10',0,'all',NULL),(11,'ALL','test all','123','percentage',30.00,40000.00,10000.00,30,0,1,'2026-06-02 00:00:00','2026-06-30 00:00:00','','','','active','123','2026-06-02 22:55:19','2026-06-02 22:55:19',0,'all',NULL),(12,'ĐỒNG','test đồng','','percentage',40.00,40000.00,10000.00,20,0,1,'2026-06-02 00:00:00','2026-06-28 00:00:00','','','','active','','2026-06-02 23:13:45','2026-06-02 23:31:51',0,'all',10),(13,'QQQ','qqq','','percentage',22.00,50000.00,5000.00,50,0,1,'2026-06-02 00:00:00','2026-06-30 00:00:00','','','','active','','2026-06-02 23:31:39','2026-06-02 23:31:39',0,'bronze',80),(14,'128','cdtn12345','','percentage',50.00,40000.00,100000.00,2,0,1,'2026-06-03 00:00:00','2026-06-04 00:00:00','','','','active','','2026-06-03 14:32:48','2026-06-03 14:32:48',0,'all',10);
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
  `province_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'Hà Nội',0),(2,'Hải Phòng',0),(3,'Quảng Ninh',0),(4,'Bình Định',0),(5,'Hưng Yên',0),(6,'Lạng Sơn',0),(7,'Phú Thọ',0),(8,'Bắc Ninh',0),(9,'Cần Thơ',0);
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
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
  `room_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_seats` int NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cinema_id` (`cinema_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'Phòng 1','Standard',30,'active',0),(2,1,'Phòng 2','VIP',16,'active',0),(3,2,'Phòng 1','Standard',25,'active',0),(4,2,'Phòng 2','VIP',10,'active',0),(5,8,'Phòng 1','Standard',18,'active',0),(6,1,'Phòng 3','VIP',30,'active',0),(7,3,'Phòng 1','Standard',50,'active',0),(8,1,'Phòng 4','Standard',60,'active',0),(9,12,'Phòng 1','Standard',10,'active',1),(10,13,'q','Standard',9,'active',0),(11,4,'Phòng 1','Standard',0,'active',0),(12,5,'Phòng 1','Standard',126,'active',0),(13,7,'Phòng 1','Standard',80,'active',0),(14,11,'Phòng 1','Standard',90,'active',0);
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
  `account_id` int unsigned NOT NULL,
  `locked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slot_id` int NOT NULL,
  PRIMARY KEY (`id`),

  KEY `idx_seat_lock_seat` (`seat_id`),
  KEY `idx_seat_lock_account` (`account_id`),
  KEY `idx_seat_lock_expires` (`expires_at`),
  CONSTRAINT `seatlocks_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seatlocks_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seatlocks`
--

LOCK TABLES `seatlocks` WRITE;
/*!40000 ALTER TABLE `seatlocks` DISABLE KEYS */;
INSERT INTO `seatlocks` VALUES (182,408,5,'2026-06-06 06:40:41','2026-06-06 06:50:41',1,'2026-06-05 23:40:40','2026-06-05 23:40:40',58);
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
  `seat_row` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type_id` int unsigned NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_id` (`room_id`,`seat_row`,`seat_number`),
  UNIQUE KEY `UKi96eqsycrd9u1o08ap90yeuaa` (`room_id`,`seat_row`,`seat_number`),
  KEY `seat_type_id` (`seat_type_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `seats_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seattypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=581 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,'A',1,1,'active'),(2,1,'A',2,1,'active'),(3,1,'A',3,1,'active'),(4,1,'A',4,1,'active'),(5,1,'B',1,1,'active'),(6,1,'B',2,1,'active'),(7,1,'B',3,1,'active'),(8,1,'B',4,1,'active'),(9,1,'C',1,3,'active'),(10,1,'C',2,3,'active'),(11,1,'C',3,3,'active'),(12,1,'C',4,3,'active'),(13,2,'A',1,2,'active'),(14,2,'A',2,2,'active'),(15,2,'A',3,2,'active'),(16,2,'A',4,2,'active'),(17,2,'B',1,2,'active'),(18,2,'B',2,2,'active'),(19,2,'B',3,2,'active'),(20,2,'B',4,2,'active'),(21,2,'C',1,2,'active'),(22,2,'C',2,2,'active'),(23,2,'C',3,2,'active'),(24,2,'C',4,2,'active'),(25,2,'D',1,3,'active'),(26,2,'D',2,3,'active'),(27,2,'D',3,3,'active'),(28,2,'D',4,3,'active'),(29,3,'A',1,1,'active'),(30,3,'A',2,1,'active'),(31,3,'A',3,1,'active'),(32,3,'B',1,1,'active'),(33,3,'B',2,1,'active'),(34,3,'B',3,1,'active'),(35,3,'C',1,2,'active'),(36,3,'C',2,2,'active'),(37,3,'C',3,2,'active'),(38,3,'D',1,3,'active'),(39,3,'D',2,3,'active'),(40,3,'D',3,3,'active'),(41,3,'A',4,1,'active'),(42,3,'A',5,1,'active'),(43,3,'B',4,1,'active'),(44,3,'B',5,1,'active'),(45,3,'C',4,2,'active'),(46,3,'C',5,2,'active'),(47,3,'D',4,3,'active'),(48,3,'D',5,3,'active'),(49,3,'E',1,1,'active'),(50,3,'E',2,1,'active'),(51,3,'E',3,1,'active'),(52,3,'E',4,1,'active'),(53,3,'E',5,1,'active'),(54,4,'A',1,2,'active'),(55,4,'A',2,2,'active'),(56,4,'A',3,2,'active'),(57,4,'A',4,2,'active'),(58,4,'A',5,2,'active'),(59,4,'B',1,2,'active'),(60,4,'B',2,2,'active'),(61,4,'B',3,2,'active'),(62,4,'B',4,2,'active'),(63,4,'B',5,2,'active'),(64,5,'A',1,1,'active'),(65,5,'A',2,1,'active'),(66,5,'A',3,1,'active'),(67,5,'B',1,1,'active'),(68,5,'B',2,1,'active'),(69,5,'B',3,1,'active'),(70,5,'C',1,1,'active'),(71,5,'C',2,1,'active'),(72,5,'C',3,1,'active'),(73,5,'D',1,2,'active'),(74,5,'D',2,2,'active'),(75,5,'D',3,2,'active'),(76,5,'E',1,2,'active'),(77,5,'E',2,2,'active'),(78,5,'E',3,2,'active'),(79,5,'F',1,2,'active'),(80,5,'F',2,2,'active'),(81,5,'F',3,2,'active'),(83,1,'A',5,1,'active'),(84,1,'A',6,1,'active'),(85,1,'A',7,1,'active'),(86,1,'A',8,1,'active'),(87,1,'A',9,1,'active'),(88,1,'A',10,1,'active'),(89,1,'B',5,1,'active'),(90,1,'B',6,1,'active'),(91,1,'B',7,1,'active'),(92,1,'B',8,1,'active'),(93,1,'B',9,1,'active'),(94,1,'B',10,1,'active'),(95,1,'C',5,3,'active'),(96,1,'C',6,3,'active'),(97,1,'C',7,3,'active'),(98,1,'C',8,3,'active'),(99,1,'C',9,3,'active'),(100,1,'C',10,3,'active'),(101,6,'A',1,1,'active'),(102,6,'A',2,1,'active'),(103,6,'A',3,1,'active'),(104,6,'A',4,1,'active'),(105,6,'A',5,1,'active'),(106,6,'A',6,1,'active'),(107,6,'A',7,1,'active'),(108,6,'A',8,1,'active'),(109,6,'A',9,1,'active'),(110,6,'A',10,1,'active'),(111,6,'B',1,1,'active'),(112,6,'B',2,1,'active'),(113,6,'B',3,1,'active'),(114,6,'B',4,1,'active'),(115,6,'B',5,1,'active'),(116,6,'B',6,1,'active'),(117,6,'B',7,1,'active'),(118,6,'B',8,1,'active'),(119,6,'B',9,1,'active'),(120,6,'B',10,1,'active'),(121,6,'C',1,3,'active'),(122,6,'C',2,3,'active'),(123,6,'C',3,3,'active'),(124,6,'C',4,3,'active'),(125,6,'C',5,3,'active'),(126,6,'C',6,3,'active'),(127,6,'C',7,3,'active'),(128,6,'C',8,3,'active'),(129,6,'C',9,3,'active'),(130,6,'C',10,3,'active'),(131,7,'A',1,1,'active'),(132,7,'A',2,1,'active'),(133,7,'A',3,1,'active'),(134,7,'A',4,1,'active'),(135,7,'A',5,1,'active'),(136,7,'A',6,1,'active'),(137,7,'A',7,1,'active'),(138,7,'A',8,1,'active'),(139,7,'A',9,1,'active'),(140,7,'A',10,1,'active'),(141,7,'B',1,1,'active'),(142,7,'B',2,1,'active'),(143,7,'B',3,1,'active'),(144,7,'B',4,1,'active'),(145,7,'B',5,1,'active'),(146,7,'B',6,1,'active'),(147,7,'B',7,1,'active'),(148,7,'B',8,1,'active'),(149,7,'B',9,1,'active'),(150,7,'B',10,1,'active'),(151,7,'C',1,1,'active'),(152,7,'C',2,1,'active'),(153,7,'C',3,1,'active'),(154,7,'C',4,1,'active'),(155,7,'C',5,1,'active'),(156,7,'C',6,1,'active'),(157,7,'C',7,1,'active'),(158,7,'C',8,1,'active'),(159,7,'C',9,1,'active'),(160,7,'C',10,1,'active'),(161,7,'D',1,1,'active'),(162,7,'D',2,1,'active'),(163,7,'D',3,1,'active'),(164,7,'D',4,1,'active'),(165,7,'D',5,1,'active'),(166,7,'D',6,1,'active'),(167,7,'D',7,1,'active'),(168,7,'D',8,1,'active'),(169,7,'D',9,1,'active'),(170,7,'D',10,1,'active'),(171,7,'E',1,2,'active'),(172,7,'E',2,2,'active'),(173,7,'E',3,2,'active'),(174,7,'E',4,2,'active'),(175,7,'E',5,2,'active'),(176,7,'E',6,2,'active'),(177,7,'E',7,2,'active'),(178,7,'E',8,2,'active'),(179,7,'E',9,2,'active'),(180,7,'E',10,2,'active'),(181,8,'A',1,2,'active'),(182,8,'A',2,2,'active'),(183,8,'A',3,2,'active'),(184,8,'A',4,2,'active'),(185,8,'A',5,2,'active'),(186,8,'A',6,2,'active'),(187,8,'A',7,2,'active'),(188,8,'A',8,2,'active'),(189,8,'A',9,2,'active'),(190,8,'A',10,2,'active'),(191,8,'B',1,2,'active'),(192,8,'B',2,2,'active'),(193,8,'B',3,2,'active'),(194,8,'B',4,2,'active'),(195,8,'B',5,2,'active'),(196,8,'B',6,2,'active'),(197,8,'B',7,2,'active'),(198,8,'B',8,2,'active'),(199,8,'B',9,2,'active'),(200,8,'B',10,2,'active'),(201,8,'C',1,2,'active'),(202,8,'C',2,2,'active'),(203,8,'C',3,2,'active'),(204,8,'C',4,2,'active'),(205,8,'C',5,2,'active'),(206,8,'C',6,2,'active'),(207,8,'C',7,2,'active'),(208,8,'C',8,2,'active'),(209,8,'C',9,2,'active'),(210,8,'C',10,2,'active'),(211,8,'D',1,3,'active'),(212,8,'D',2,3,'active'),(213,8,'D',3,3,'active'),(214,8,'D',4,3,'active'),(215,8,'D',5,3,'active'),(216,8,'D',6,3,'active'),(217,8,'D',7,3,'active'),(218,8,'D',8,3,'active'),(219,8,'D',9,3,'active'),(220,8,'D',10,3,'active'),(221,8,'E',1,3,'active'),(222,8,'E',2,3,'active'),(223,8,'E',3,3,'active'),(224,8,'E',4,3,'active'),(225,8,'E',5,3,'active'),(226,8,'E',6,3,'active'),(227,8,'E',7,3,'active'),(228,8,'E',8,3,'active'),(229,8,'E',9,3,'active'),(230,8,'E',10,3,'active'),(231,9,'A',1,1,'active'),(232,9,'A',2,1,'active'),(233,9,'A',3,1,'active'),(234,9,'A',4,1,'active'),(235,9,'A',5,1,'active'),(236,9,'A',6,1,'active'),(237,9,'A',7,1,'active'),(238,9,'A',8,1,'active'),(239,9,'A',9,1,'active'),(240,9,'A',10,1,'active'),(241,10,'A',1,1,'active'),(242,10,'A',2,1,'active'),(243,10,'A',3,1,'active'),(244,10,'A',4,1,'active'),(245,10,'A',5,1,'active'),(246,10,'A',6,1,'active'),(247,10,'A',7,1,'active'),(248,10,'A',8,1,'active'),(249,10,'A',9,1,'active'),(261,8,'F',1,3,'active'),(262,8,'F',2,3,'active'),(263,8,'F',3,3,'active'),(264,8,'F',4,3,'active'),(265,8,'F',5,3,'active'),(266,8,'F',6,3,'active'),(267,8,'F',7,3,'active'),(268,8,'F',8,3,'active'),(269,8,'F',9,3,'active'),(270,8,'F',10,3,'active'),(271,12,'A',1,1,'active'),(272,12,'A',2,1,'active'),(273,12,'A',3,1,'active'),(274,12,'A',4,1,'active'),(275,12,'A',5,1,'active'),(276,12,'A',6,1,'active'),(277,12,'A',7,1,'active'),(278,12,'A',8,1,'active'),(279,12,'A',9,1,'active'),(280,12,'A',10,1,'active'),(281,12,'A',11,1,'active'),(282,12,'A',12,1,'active'),(283,12,'A',13,1,'active'),(284,12,'A',14,1,'active'),(285,12,'A',15,1,'active'),(286,12,'A',16,1,'active'),(287,12,'A',17,1,'active'),(288,12,'A',18,1,'active'),(291,12,'B',1,1,'active'),(292,12,'B',2,1,'active'),(293,12,'B',3,1,'active'),(294,12,'B',4,1,'active'),(295,12,'B',5,1,'active'),(296,12,'B',6,1,'active'),(297,12,'B',7,1,'active'),(298,12,'B',8,1,'active'),(299,12,'B',9,1,'active'),(300,12,'B',10,1,'active'),(301,12,'B',11,1,'active'),(302,12,'B',12,1,'active'),(303,12,'B',13,1,'active'),(304,12,'B',14,1,'active'),(305,12,'B',15,1,'active'),(306,12,'B',16,1,'active'),(307,12,'B',17,1,'active'),(308,12,'B',18,1,'active'),(311,12,'C',1,1,'active'),(312,12,'C',2,1,'active'),(313,12,'C',3,1,'active'),(314,12,'C',4,1,'active'),(315,12,'C',5,1,'active'),(316,12,'C',6,1,'active'),(317,12,'C',7,1,'active'),(318,12,'C',8,1,'active'),(319,12,'C',9,1,'active'),(320,12,'C',10,1,'active'),(321,12,'C',11,1,'active'),(322,12,'C',12,1,'active'),(323,12,'C',13,1,'active'),(324,12,'C',14,1,'active'),(325,12,'C',15,1,'active'),(326,12,'C',16,1,'active'),(327,12,'C',17,1,'active'),(328,12,'C',18,1,'active'),(331,12,'D',1,1,'active'),(332,12,'D',2,1,'active'),(333,12,'D',3,1,'active'),(334,12,'D',4,1,'active'),(335,12,'D',5,1,'active'),(336,12,'D',6,1,'active'),(337,12,'D',7,1,'active'),(338,12,'D',8,1,'active'),(339,12,'D',9,1,'active'),(340,12,'D',10,1,'active'),(341,12,'D',11,1,'active'),(342,12,'D',12,1,'active'),(343,12,'D',13,1,'active'),(344,12,'D',14,1,'active'),(345,12,'D',15,1,'active'),(346,12,'D',16,1,'active'),(347,12,'D',17,1,'active'),(348,12,'D',18,1,'active'),(351,12,'E',1,2,'active'),(352,12,'E',2,2,'active'),(353,12,'E',3,2,'active'),(354,12,'E',4,2,'active'),(355,12,'E',5,2,'active'),(356,12,'E',6,2,'active'),(357,12,'E',7,2,'active'),(358,12,'E',8,2,'active'),(359,12,'E',9,2,'active'),(360,12,'E',10,2,'active'),(361,12,'E',11,2,'active'),(362,12,'E',12,2,'active'),(363,12,'E',13,2,'active'),(364,12,'E',14,2,'active'),(365,12,'E',15,2,'active'),(366,12,'E',16,2,'active'),(367,12,'E',17,2,'active'),(368,12,'E',18,2,'active'),(371,12,'F',1,2,'active'),(372,12,'F',2,2,'active'),(373,12,'F',3,2,'active'),(374,12,'F',4,2,'active'),(375,12,'F',5,2,'active'),(376,12,'F',6,2,'active'),(377,12,'F',7,2,'active'),(378,12,'F',8,2,'active'),(379,12,'F',9,2,'active'),(380,12,'F',10,2,'active'),(381,12,'F',11,2,'active'),(382,12,'F',12,2,'active'),(383,12,'F',13,2,'active'),(384,12,'F',14,2,'active'),(385,12,'F',15,2,'active'),(386,12,'F',16,2,'active'),(387,12,'F',17,2,'active'),(388,12,'F',18,2,'active'),(391,12,'G',1,3,'active'),(392,12,'G',2,3,'active'),(393,12,'G',3,3,'active'),(394,12,'G',4,3,'active'),(395,12,'G',5,3,'active'),(396,12,'G',6,3,'active'),(397,12,'G',7,3,'active'),(398,12,'G',8,3,'active'),(399,12,'G',9,3,'active'),(400,12,'G',10,3,'active'),(401,12,'G',11,3,'active'),(402,12,'G',12,3,'active'),(403,12,'G',13,3,'active'),(404,12,'G',14,3,'active'),(405,12,'G',15,3,'active'),(406,12,'G',16,3,'active'),(407,12,'G',17,3,'active'),(408,12,'G',18,3,'active'),(411,13,'A',1,1,'active'),(412,13,'A',2,1,'active'),(413,13,'A',3,1,'active'),(414,13,'A',4,1,'active'),(415,13,'A',5,1,'active'),(416,13,'A',6,1,'active'),(417,13,'A',7,1,'active'),(418,13,'A',8,1,'active'),(419,13,'A',9,1,'active'),(420,13,'A',10,1,'active'),(421,13,'B',1,1,'active'),(422,13,'B',2,1,'active'),(423,13,'B',3,1,'active'),(424,13,'B',4,1,'active'),(425,13,'B',5,1,'active'),(426,13,'B',6,1,'active'),(427,13,'B',7,1,'active'),(428,13,'B',8,1,'active'),(429,13,'B',9,1,'active'),(430,13,'B',10,1,'active'),(431,13,'C',1,1,'active'),(432,13,'C',2,1,'active'),(433,13,'C',3,1,'active'),(434,13,'C',4,1,'active'),(435,13,'C',5,1,'active'),(436,13,'C',6,1,'active'),(437,13,'C',7,1,'active'),(438,13,'C',8,1,'active'),(439,13,'C',9,1,'active'),(440,13,'C',10,1,'active'),(441,13,'D',1,2,'active'),(442,13,'D',2,2,'active'),(443,13,'D',3,2,'active'),(444,13,'D',4,2,'active'),(445,13,'D',5,2,'active'),(446,13,'D',6,2,'active'),(447,13,'D',7,2,'active'),(448,13,'D',8,2,'active'),(449,13,'D',9,2,'active'),(450,13,'D',10,2,'active'),(451,13,'E',1,2,'active'),(452,13,'E',2,2,'active'),(453,13,'E',3,2,'active'),(454,13,'E',4,2,'active'),(455,13,'E',5,2,'active'),(456,13,'E',6,2,'active'),(457,13,'E',7,2,'active'),(458,13,'E',8,2,'active'),(459,13,'E',9,2,'active'),(460,13,'E',10,2,'active'),(461,13,'F',1,2,'active'),(462,13,'F',2,2,'active'),(463,13,'F',3,2,'active'),(464,13,'F',4,2,'active'),(465,13,'F',5,2,'active'),(466,13,'F',6,2,'active'),(467,13,'F',7,2,'active'),(468,13,'F',8,2,'active'),(469,13,'F',9,2,'active'),(470,13,'F',10,2,'active'),(471,13,'G',1,3,'active'),(472,13,'G',2,3,'active'),(473,13,'G',3,3,'active'),(474,13,'G',4,3,'active'),(475,13,'G',5,3,'active'),(476,13,'G',6,3,'active'),(477,13,'G',7,3,'active'),(478,13,'G',8,3,'active'),(479,13,'G',9,3,'active'),(480,13,'G',10,3,'active'),(481,13,'H',1,3,'active'),(482,13,'H',2,3,'active'),(483,13,'H',3,3,'active'),(484,13,'H',4,3,'active'),(485,13,'H',5,3,'active'),(486,13,'H',6,3,'active'),(487,13,'H',7,3,'active'),(488,13,'H',8,3,'active'),(489,13,'H',9,3,'active'),(490,13,'H',10,3,'active'),(491,14,'A',1,1,'active'),(492,14,'A',2,1,'active'),(493,14,'A',3,1,'active'),(494,14,'A',4,1,'active'),(495,14,'A',5,1,'active'),(496,14,'A',6,1,'active'),(497,14,'A',7,1,'active'),(498,14,'A',8,1,'active'),(499,14,'A',9,1,'active'),(500,14,'A',10,1,'active'),(501,14,'B',1,1,'active'),(502,14,'B',2,1,'active'),(503,14,'B',3,1,'active'),(504,14,'B',4,1,'active'),(505,14,'B',5,1,'active'),(506,14,'B',6,1,'active'),(507,14,'B',7,1,'active'),(508,14,'B',8,1,'active'),(509,14,'B',9,1,'active'),(510,14,'B',10,1,'active'),(511,14,'C',1,1,'active'),(512,14,'C',2,1,'active'),(513,14,'C',3,1,'active'),(514,14,'C',4,1,'active'),(515,14,'C',5,1,'active'),(516,14,'C',6,1,'active'),(517,14,'C',7,1,'active'),(518,14,'C',8,1,'active'),(519,14,'C',9,1,'active'),(520,14,'C',10,1,'active'),(521,14,'D',1,1,'active'),(522,14,'D',2,1,'active'),(523,14,'D',3,1,'active'),(524,14,'D',4,1,'active'),(525,14,'D',5,1,'active'),(526,14,'D',6,1,'active'),(527,14,'D',7,1,'active'),(528,14,'D',8,1,'active'),(529,14,'D',9,1,'active'),(530,14,'D',10,1,'active'),(531,14,'E',1,2,'active'),(532,14,'E',2,2,'active'),(533,14,'E',3,2,'active'),(534,14,'E',4,2,'active'),(535,14,'E',5,2,'active'),(536,14,'E',6,2,'active'),(537,14,'E',7,2,'active'),(538,14,'E',8,2,'active'),(539,14,'E',9,2,'active'),(540,14,'E',10,2,'active'),(541,14,'F',1,2,'active'),(542,14,'F',2,2,'active'),(543,14,'F',3,2,'active'),(544,14,'F',4,2,'active'),(545,14,'F',5,2,'active'),(546,14,'F',6,2,'active'),(547,14,'F',7,2,'active'),(548,14,'F',8,2,'active'),(549,14,'F',9,2,'active'),(550,14,'F',10,2,'active'),(551,14,'G',1,2,'active'),(552,14,'G',2,2,'active'),(553,14,'G',3,2,'active'),(554,14,'G',4,2,'active'),(555,14,'G',5,2,'active'),(556,14,'G',6,2,'active'),(557,14,'G',7,2,'active'),(558,14,'G',8,2,'active'),(559,14,'G',9,2,'active'),(560,14,'G',10,2,'active'),(561,14,'H',1,3,'active'),(562,14,'H',2,3,'active'),(563,14,'H',3,3,'active'),(564,14,'H',4,3,'active'),(565,14,'H',5,3,'active'),(566,14,'H',6,3,'active'),(567,14,'H',7,3,'active'),(568,14,'H',8,3,'active'),(569,14,'H',9,3,'active'),(570,14,'H',10,3,'active'),(571,14,'J',1,3,'active'),(572,14,'J',2,3,'active'),(573,14,'J',3,3,'active'),(574,14,'J',4,3,'active'),(575,14,'J',5,3,'active'),(576,14,'J',6,3,'active'),(577,14,'J',7,3,'active'),(578,14,'J',8,3,'active'),(579,14,'J',9,3,'active'),(580,14,'J',10,3,'active');
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
  `type_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_multiplier` decimal(3,2) DEFAULT '1.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `couple_price` decimal(10,2) DEFAULT NULL,
  `vip_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `slots_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `slots_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slots`
--

LOCK TABLES `slots` WRITE;
/*!40000 ALTER TABLE `slots` DISABLE KEYS */;
INSERT INTO `slots` VALUES (1,10,1,'2026-03-09 08:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:35:05',0,NULL,NULL),(2,10,1,'2026-03-09 10:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:35:34',0,NULL,NULL),(3,10,1,'2026-03-08 23:00:00','2026-03-08 23:01:00',80000.00,12,'2026-03-09 00:36:27',0,NULL,NULL),(4,10,1,'2026-03-09 09:00:00','2026-03-09 16:59:00',80000.00,12,'2026-03-09 00:37:09',0,NULL,NULL),(5,10,2,'2026-03-09 08:00:00','2026-03-09 16:59:00',80000.00,16,'2026-03-09 00:38:42',0,NULL,NULL),(6,10,2,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,16,'2026-03-09 00:39:16',0,NULL,NULL),(7,10,3,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,25,'2026-03-09 00:39:50',0,NULL,NULL),(8,10,3,'2026-03-09 13:00:00','2026-03-09 16:59:00',80000.00,25,'2026-03-09 00:40:21',0,NULL,NULL),(9,10,5,'2026-03-09 11:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:41:12',0,NULL,NULL),(10,10,5,'2026-03-09 13:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:41:43',0,NULL,NULL),(11,9,5,'2026-03-09 14:00:00','2026-03-09 16:59:00',80000.00,18,'2026-03-09 00:44:01',0,NULL,NULL),(12,9,2,'2026-05-21 08:00:00','2026-05-21 11:00:00',80000.00,16,'2026-05-21 02:11:49',0,NULL,NULL),(13,9,1,'2026-05-23 08:00:00','2026-05-23 11:00:00',120000.00,12,'2026-05-21 21:54:49',0,NULL,NULL),(14,18,3,'2026-05-23 09:46:00','2026-05-23 11:35:00',120000.00,25,'2026-05-22 09:46:24',0,NULL,NULL),(15,9,6,'2026-05-24 00:45:00','2026-05-23 02:39:00',120000.00,30,'2026-05-23 00:45:46',0,NULL,NULL),(16,3,7,'2026-05-25 22:25:00','2026-05-25 00:12:00',80000.00,40,'2026-05-24 22:25:38',0,NULL,NULL),(17,9,1,'2026-05-28 08:00:00','2026-05-28 11:00:00',80000.00,24,'2026-05-27 07:08:23',0,NULL,NULL),(18,1,1,'2024-10-10 10:00:00','2024-10-10 12:00:00',80000.00,30,'2026-05-28 19:28:48',0,NULL,NULL),(19,1,1,'2024-10-10 10:00:00','2024-10-10 12:00:00',80000.00,30,'2026-05-28 19:32:35',0,NULL,NULL),(20,1,1,'2024-10-10 10:00:00','2024-10-10 12:00:00',80000.00,30,'2026-05-28 20:22:09',0,NULL,NULL),(21,18,1,'2026-05-29 20:28:00','2026-05-29 22:17:00',80000.00,29,'2026-05-28 20:28:50',0,NULL,NULL),(22,18,6,'2026-05-29 20:30:00','2026-05-29 22:19:00',80000.00,28,'2026-05-28 20:30:16',0,NULL,NULL),(30,1,1,'2026-03-15 18:00:00','2026-03-15 21:00:00',80000.00,13,'2026-03-10 10:00:00',0,NULL,NULL),(31,2,2,'2026-03-15 19:00:00','2026-03-15 21:30:00',80000.00,16,'2026-03-10 10:00:00',0,NULL,NULL),(32,3,3,'2026-03-16 09:00:00','2026-03-16 11:00:00',80000.00,25,'2026-03-10 10:00:00',0,NULL,NULL),(33,4,4,'2026-03-16 14:00:00','2026-03-16 16:00:00',80000.00,10,'2026-03-10 10:00:00',0,NULL,NULL),(34,5,5,'2026-03-17 10:00:00','2026-03-17 12:00:00',80000.00,18,'2026-03-10 10:00:00',0,NULL,NULL),(35,6,8,'2026-05-30 20:12:00','2026-05-30 22:19:00',120000.00,0,'2026-05-29 20:12:11',0,NULL,NULL),(36,9,1,'2026-05-30 08:00:00','2026-05-30 11:00:00',120000.00,29,'2026-05-29 20:28:21',0,NULL,NULL),(37,6,8,'2026-05-30 03:24:00','2026-05-29 05:31:00',120000.00,50,'2026-05-30 01:24:13',0,NULL,NULL),(38,6,6,'2026-05-31 09:11:00','2026-05-31 11:18:00',120000.00,22,'2026-05-30 09:11:21',0,NULL,NULL),(39,3,1,'2026-05-31 16:30:00','2026-05-31 18:17:00',120000.00,30,'2026-05-31 15:30:49',0,NULL,NULL),(40,9,1,'2026-05-31 08:00:00','2026-05-31 11:00:00',120000.00,29,'2026-05-31 16:14:47',0,NULL,NULL),(41,10,1,'2026-05-31 08:00:00','2026-05-31 11:00:00',120000.00,30,'2026-05-31 16:14:56',0,NULL,NULL),(42,11,2,'2026-05-31 08:00:00','2026-05-31 11:00:00',120000.00,16,'2026-05-31 16:18:40',0,NULL,NULL),(43,3,9,'2026-05-31 21:19:00','2026-05-31 23:06:00',120000.00,10,'2026-05-31 21:19:56',0,NULL,NULL),(44,6,8,'2026-06-02 10:36:00','2026-06-02 12:43:00',80000.00,58,'2026-06-01 10:37:03',0,NULL,NULL),(45,7,1,'2026-06-06 11:03:00','2026-06-06 13:20:00',120000.00,26,'2026-06-01 11:03:41',0,NULL,NULL),(46,20,5,'2026-06-03 21:50:00','2026-06-03 23:27:00',80000.00,18,'2026-06-02 15:50:42',0,NULL,NULL),(47,20,5,'2026-06-03 22:50:00','2026-06-03 00:27:00',80000.00,18,'2026-06-02 15:54:10',1,NULL,NULL),(48,20,5,'2026-06-03 21:50:00','2026-06-03 23:27:00',80000.00,18,'2026-06-02 15:55:03',0,NULL,NULL),(49,16,12,'2026-06-16 17:41:00','2026-06-16 19:25:00',80000.00,140,'2026-06-02 16:41:39',0,NULL,NULL),(50,3,12,'2026-06-05 17:43:00','2026-06-05 19:30:00',80000.00,128,'2026-06-02 16:43:09',0,NULL,NULL),(51,12,8,'2026-06-04 10:43:00','2026-06-04 12:49:00',80000.00,57,'2026-06-03 10:43:14',0,NULL,NULL),(52,15,4,'2026-06-05 17:29:00','2026-06-05 19:45:00',80000.00,10,'2026-06-04 16:30:01',0,NULL,NULL),(53,7,2,'2026-06-06 00:14:00','2026-06-05 02:31:00',75000.00,16,'2026-06-05 00:29:04',0,200000.00,110000.00),(54,6,1,'2026-06-06 00:29:00','2026-06-05 02:36:00',75000.00,30,'2026-06-05 00:29:48',0,200000.00,110000.00),(55,18,1,'2026-06-06 06:30:00','2026-06-06 08:19:00',75000.00,30,'2026-06-05 00:30:51',0,200000.00,110000.00),(56,20,1,'2026-06-07 00:52:00','2026-06-06 02:29:00',75000.00,30,'2026-06-05 00:51:43',0,200000.00,110000.00),(57,18,1,'2026-06-10 00:52:00','2026-06-09 02:41:00',75000.00,30,'2026-06-05 00:53:02',0,200000.00,110000.00),(58,21,12,'2026-06-09 23:23:00','2026-06-09 01:08:00',75000.00,125,'2026-06-06 04:24:04',0,200000.00,110000.00);
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
  `tickets_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_data` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tickets_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(38,2) DEFAULT NULL,
  `final_amount` decimal(38,2) NOT NULL,
  `payment_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `promotion_id` int unsigned DEFAULT NULL,
  `promotion_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_code` (`tickets_code`),
  KEY `account_id` (`account_id`),
  KEY `slot_id` (`slot_id`),
  KEY `idx_tickets_promotion_id` (`promotion_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id`),
  CONSTRAINT `tickets_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,3,10,'CGV1773017700438497',NULL,NULL,'2026-03-09 00:55:00',146000.00,0.00,146000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(2,3,11,'CGV1773017957638259',NULL,NULL,'2026-03-09 00:59:18',80000.00,0.00,80000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(3,3,3,'CGV1773018015247750',NULL,NULL,'2026-03-09 01:00:15',120000.00,0.00,120000.00,'unpaid','cancelled','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(4,3,2,'CGV1773037880838228',NULL,NULL,'2026-03-09 06:31:21',120000.00,0.00,120000.00,'paid','confirmed','Đặt vé thành công qua hệ thống CGV',0,NULL,NULL),(5,5,15,'CGV1779489731689','/qr/CGV1779489731689.png','{\"code\":\"CGV1779489731689\",\"slot\":15,\"seats\":[A1,A2]}','2026-05-23 05:42:12',240000.00,20000.00,220000.00,'paid','confirmed','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(6,5,15,'CGV1779490600850','/qr/CGV1779490600850.png','{\"code\":\"CGV1779490600850\",\"slot\":15,\"seats\":[A3,A4]}','2026-05-23 05:56:41',240000.00,20000.00,220000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(7,5,15,'CGV1779493923824','/qr/CGV1779493923824.png','{\"code\":\"CGV1779493923824\",\"slot\":15,\"seats\":[A5]}','2026-05-23 06:52:04',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(8,5,15,'CGV1779494368692','/qr/CGV1779494368692.png','{\"code\":\"CGV1779494368692\",\"slot\":15,\"seats\":[A6]}','2026-05-23 06:59:29',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(9,5,15,'CGV1779494949948','/qr/CGV1779494949948.png','{\"code\":\"CGV1779494949948\",\"slot\":15,\"seats\":[A7]}','2026-05-23 07:09:10',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(10,5,15,'CGV1779495739064','/qr/CGV1779495739064.png','{\"code\":\"CGV1779495739064\",\"slot\":15,\"seats\":[A8]}','2026-05-23 07:22:19',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(11,5,15,'CGV1779496065847','/qr/CGV1779496065847.png','{\"code\":\"CGV1779496065847\",\"slot\":15,\"seats\":[A9]}','2026-05-23 07:27:46',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(12,5,15,'CGV1779496811871','/qr/CGV1779496811871.png','{\"code\":\"CGV1779496811871\",\"slot\":15,\"seats\":[A10]}','2026-05-23 07:40:12',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(13,5,15,'CGV1779498548422','/qr/CGV1779498548422.png','{\"code\":\"CGV1779498548422\",\"slot\":15,\"seats\":[B1]}','2026-05-23 08:09:08',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(14,5,15,'CGV1779502325400','/qr/CGV1779502325400.png','{\"code\":\"CGV1779502325400\",\"slot\":15,\"seats\":[B2]}','2026-05-23 09:12:05',120000.00,20000.00,100000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(15,5,16,'CGV1779667124426','/qr/CGV1779667124426.png','{\"code\":\"CGV1779667124426\",\"slot\":16,\"seats\":[D8]}','2026-05-25 06:58:44',80000.00,0.00,80000.00,'unpaid','cancelled','Doraemon: Nobita and the Sky Utopia',0,NULL,NULL),(16,5,16,'CGV1779669754019','/qr/CGV1779669754019.png','{\"code\":\"CGV1779669754019\",\"slot\":16,\"seats\":[B7]}','2026-05-25 07:42:34',80000.00,0.00,80000.00,'unpaid','cancelled','Doraemon: Nobita and the Sky Utopia',0,NULL,NULL),(17,5,16,'CGV1779681465414','/qr/CGV1779681465414.png','{\"code\":\"CGV1779681465414\",\"slot\":16,\"seats\":[D9]}','2026-05-25 10:57:45',80000.00,0.00,80000.00,'unpaid','cancelled','Doraemon: Nobita and the Sky Utopia',0,NULL,NULL),(18,5,16,'CGV1779682121796','/qr/CGV1779682121796.png','{\"code\":\"CGV1779682121796\",\"slot\":16,\"seats\":[E10]}','2026-05-25 11:08:42',396000.00,0.00,396000.00,'unpaid','cancelled','Doraemon: Nobita and the Sky Utopia',0,NULL,NULL),(19,5,17,'CGV1779844348767','/qr/CGV1779844348767.png','{\"code\":\"CGV1779844348767\",\"slot\":17,\"seats\":[A1]}','2026-05-27 08:12:29',80000.00,20000.00,60000.00,'unpaid','cancelled','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(20,5,17,'CGV1779844832075','/qr/CGV1779844832075.png','{\"code\":\"CGV1779844832075\",\"slot\":17,\"seats\":[A2]}','2026-05-27 08:20:33',80000.00,20000.00,60000.00,'paid','confirmed','Khách hàng mua qua app, ko áp dụng mã giảm giá 20k',0,NULL,NULL),(21,5,17,'CGV1779845718141','/qr/CGV1779845718141.png','{\"code\":\"CGV1779845718141\",\"slot\":17,\"seats\":[A3]}','2026-05-27 08:35:18',80000.00,20000.00,60000.00,'paid','confirmed','Khách hàng mua qua app',0,NULL,NULL),(22,5,17,'CGV1779846769437','/qr/CGV1779846769437.png','{\"code\":\"CGV1779846769437\",\"slot\":17,\"seats\":[A5]}','2026-05-27 08:52:49',80000.00,0.00,80000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(23,5,17,'CGV1779851710007','/qr/CGV1779851710007.png','{\"code\":\"CGV1779851710007\",\"slot\":17,\"seats\":[B10]}','2026-05-27 10:15:10',80000.00,0.00,80000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(24,5,17,'CGV1779851888983','/qr/CGV1779851888983.png','{\"code\":\"CGV1779851888983\",\"slot\":17,\"seats\":[B9]}','2026-05-27 10:18:09',130000.00,0.00,130000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(25,5,17,'CGV1779852105224','/qr/CGV1779852105224.png','{\"code\":\"CGV1779852105224\",\"slot\":17,\"seats\":[C8]}','2026-05-27 10:21:45',260000.00,0.00,260000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(26,5,22,'CGV1779975087457','/qr/CGV1779975087457.png','{\"code\":\"CGV1779975087457\",\"slot\":22,\"seats\":[C7]}','2026-05-28 20:31:27',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé ĐỘI THÁM TỬ CỪU qua PayOS',0,NULL,NULL),(27,5,22,'CGV1779975860992','/qr/CGV1779975860992.png','{\"code\":\"CGV1779975860992\",\"slot\":22,\"seats\":[B9]}','2026-05-28 20:44:21',80000.00,0.00,80000.00,'paid','confirmed','Thanh toán vé ĐỘI THÁM TỬ CỪU qua PayOS',0,NULL,NULL),(28,5,21,'CGV1779981494919','/qr/CGV1779981494919.png','{\"code\":\"CGV1779981494919\",\"slot\":21,\"seats\":[A6]}','2026-05-28 22:18:15',130000.00,0.00,130000.00,'paid','confirmed','Thanh toán vé ĐỘI THÁM TỬ CỪU qua PayOS',0,NULL,NULL),(100,16,30,'CGV2026031200001',NULL,NULL,'2026-03-12 08:05:00',80000.00,0.00,80000.00,'paid','confirmed',NULL,0,NULL,NULL),(101,17,30,'CGV2026031200002',NULL,NULL,'2026-03-12 08:20:00',250000.00,0.00,250000.00,'paid','confirmed',NULL,0,NULL,NULL),(102,18,30,'CGV2026031200003',NULL,NULL,'2026-03-12 08:35:00',120000.00,0.00,120000.00,'paid','confirmed',NULL,0,NULL,NULL),(103,19,31,'CGV2026031200004',NULL,NULL,'2026-03-12 09:05:00',146000.00,0.00,146000.00,'paid','confirmed',NULL,0,NULL,NULL),(104,20,31,'CGV2026031200005',NULL,NULL,'2026-03-12 09:25:00',252000.00,0.00,252000.00,'paid','confirmed',NULL,0,NULL,NULL),(105,21,31,'CGV2026031200006',NULL,NULL,'2026-03-12 09:50:00',120000.00,0.00,120000.00,'paid','confirmed',NULL,0,NULL,NULL),(106,22,32,'CGV2026031200007',NULL,NULL,'2026-03-12 10:05:00',80000.00,0.00,80000.00,'paid','confirmed',NULL,0,NULL,NULL),(107,23,32,'CGV2026031200008',NULL,NULL,'2026-03-12 10:20:00',186000.00,0.00,186000.00,'paid','confirmed',NULL,0,NULL,NULL),(108,24,32,'CGV2026031200009',NULL,NULL,'2026-03-12 10:35:00',180000.00,0.00,180000.00,'paid','confirmed',NULL,0,NULL,NULL),(109,25,33,'CGV2026031200010',NULL,NULL,'2026-03-12 11:05:00',96000.00,0.00,96000.00,'paid','confirmed',NULL,0,NULL,NULL),(110,26,33,'CGV2026031200011',NULL,NULL,'2026-03-12 14:05:00',186000.00,0.00,186000.00,'paid','confirmed',NULL,0,NULL,NULL),(111,27,33,'CGV2026031200012',NULL,NULL,'2026-03-12 14:35:00',96000.00,0.00,96000.00,'paid','confirmed',NULL,0,NULL,NULL),(112,28,34,'CGV2026031200013',NULL,NULL,'2026-03-12 15:05:00',130000.00,0.00,130000.00,'paid','confirmed',NULL,0,NULL,NULL),(113,29,34,'CGV2026031200014',NULL,NULL,'2026-03-12 15:35:00',80000.00,0.00,80000.00,'paid','confirmed',NULL,0,NULL,NULL),(114,30,34,'CGV2026031200015',NULL,NULL,'2026-03-12 16:00:00',80000.00,0.00,80000.00,'paid','confirmed',NULL,0,NULL,NULL),(115,31,30,'CGV2026031200016',NULL,NULL,'2026-03-12 16:30:00',80000.00,0.00,80000.00,'unpaid','cancelled',NULL,0,NULL,NULL),(116,32,31,'CGV2026031200017',NULL,NULL,'2026-03-12 17:00:00',96000.00,0.00,96000.00,'unpaid','cancelled',NULL,0,NULL,NULL),(117,33,32,'CGV2026031200018',NULL,NULL,'2026-03-12 17:30:00',96000.00,0.00,96000.00,'paid','confirmed',NULL,0,NULL,NULL),(118,34,33,'CGV2026031200019',NULL,NULL,'2026-03-12 18:00:00',96000.00,0.00,96000.00,'paid','confirmed',NULL,0,NULL,NULL),(119,35,34,'CGV2026031200020',NULL,NULL,'2026-03-12 18:30:00',80000.00,0.00,80000.00,'paid','confirmed',NULL,0,NULL,NULL),(120,5,36,'CGV1780061390581','/qr/CGV1780061390581.png','{\"code\":\"CGV1780061390581\",\"slot\":36,\"seats\":[A1,A2]}','2026-05-29 20:29:51',290000.00,0.00,290000.00,'unpaid','cancelled','Test gửi mail đặt vé',0,NULL,NULL),(121,5,37,'CGV1780079079792','/qr/CGV1780079079792.png','{\"code\":\"CGV1780079079792\",\"slot\":37,\"seats\":[A8]}','2026-05-30 01:24:40',144000.00,0.00,144000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(122,5,37,'CGV1780080891591','/qr/CGV1780080891591.png','{\"code\":\"CGV1780080891591\",\"slot\":37,\"seats\":[C4]}','2026-05-30 01:54:52',144000.00,0.00,144000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(123,5,37,'CGV1780081435373','/qr/CGV1780081435373.png','{\"code\":\"CGV1780081435373\",\"slot\":37,\"seats\":[C8]}','2026-05-30 02:03:55',144000.00,0.00,144000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(124,5,37,'CGV1780081992134','/qr/CGV1780081992134.png','{\"code\":\"CGV1780081992134\",\"slot\":37,\"seats\":[E10]}','2026-05-30 02:13:12',180000.00,0.00,180000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(125,5,38,'CGV1780107113750','/qr/CGV1780107113750.png','{\"code\":\"CGV1780107113750\",\"slot\":38,\"seats\":[C7]}','2026-05-30 09:11:54',180000.00,0.00,180000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(126,5,38,'CGV1780107635948','/qr/CGV1780107635948.png','{\"code\":\"CGV1780107635948\",\"slot\":38,\"seats\":[C10]}','2026-05-30 09:20:36',180000.00,0.00,180000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(127,5,38,'CGV1780128667645','/qr/CGV1780128667645.png','{\"code\":\"CGV1780128667645\",\"slot\":38,\"seats\":[B10]}','2026-05-30 15:11:08',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(128,5,38,'CGV1780128854129','/qr/CGV1780128854129.png','{\"code\":\"CGV1780128854129\",\"slot\":38,\"seats\":[B8]}','2026-05-30 15:14:14',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(129,5,38,'CGV1780129133065','/qr/CGV1780129133065.png','{\"code\":\"CGV1780129133065\",\"slot\":38,\"seats\":[B1]}','2026-05-30 15:18:53',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(130,5,38,'CGV1780129879164','/qr/CGV1780129879164.png','{\"code\":\"CGV1780129879164\",\"slot\":38,\"seats\":[B6]}','2026-05-30 15:31:20',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(131,5,38,'CGV1780130174115','/qr/CGV1780130174115.png','{\"code\":\"CGV1780130174115\",\"slot\":38,\"seats\":[B5]}','2026-05-30 15:36:14',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(132,5,38,'CGV1780134765854','/qr/CGV1780134765854.png','{\"code\":\"CGV1780134765854\",\"slot\":38,\"seats\":[B3]}','2026-05-30 16:52:46',170000.00,0.00,170000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(133,5,36,'CGV1780151169742','/qr/CGV1780151169742.png','{\"code\":\"CGV1780151169742\",\"slot\":36,\"seats\":[B10]}','2026-05-30 21:26:10',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(134,5,38,'CGV1780167431753','/qr/CGV1780167431753.png','{\"code\":\"CGV1780167431753\",\"slot\":38,\"seats\":[B4]}','2026-05-31 01:57:12',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(135,5,38,'CGV1780215651623','/qr/CGV1780215651623.png','{\"code\":\"CGV1780215651623\",\"slot\":38,\"seats\":[B7]}','2026-05-31 15:20:52',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(136,5,38,'CGV1780215865170','/qr/CGV1780215865170.png','{\"code\":\"CGV1780215865170\",\"slot\":38,\"seats\":[A5]}','2026-05-31 15:24:25',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(137,5,38,'CGV1780216627241','/qr/CGV1780216627241.png','{\"code\":\"CGV1780216627241\",\"slot\":38,\"seats\":[A6]}','2026-05-31 15:37:07',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(138,5,38,'CGV1780217209567','/qr/CGV1780217209567.png','{\"code\":\"CGV1780217209567\",\"slot\":38,\"seats\":[C4]}','2026-05-31 15:46:50',180000.00,0.00,180000.00,'unpaid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(139,5,38,'CGV1780218364320','/qr/CGV1780218364320.png','{\"code\":\"CGV1780218364320\",\"slot\":38,\"seats\":[B2]}','2026-05-31 16:06:04',120000.00,0.00,120000.00,'paid','cancelled','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(140,5,40,'CGV1780220138380','/qr/CGV1780220138380.png','{\"code\":\"CGV1780220138380\",\"slot\":40,\"seats\":[B6]}','2026-05-31 16:35:38',120000.00,24000.00,96000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(141,5,40,'CGV1780221522147','/qr/CGV1780221522147.png','{\"code\":\"CGV1780221522147\",\"slot\":40,\"seats\":[B10]}','2026-05-31 16:58:42',170000.00,34000.00,136000.00,'paid','confirmed','Thanh toán vé KHÔNG CÒN CHÚNG TA qua PayOS',0,NULL,NULL),(142,38,44,'CGV1780285166209','/qr/CGV1780285166209.png','{\"code\":\"CGV1780285166209\",\"slot\":44,\"seats\":[F8,F9]}','2026-06-01 10:39:26',240000.00,40000.00,200000.00,'paid','confirmed','Thanh toán vé THỎ ƠI!! qua PayOS',0,NULL,NULL),(143,38,45,'CGV1780286672136','/qr/CGV1780286672136.png','{\"code\":\"CGV1780286672136\",\"slot\":45,\"seats\":[B10]}','2026-06-01 11:04:32',120000.00,24000.00,96000.00,'paid','confirmed','Thanh toán vé CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI qua PayOS',0,NULL,NULL),(144,5,45,'CGV1780307983454','/qr/CGV1780307983454.png','{\"code\":\"CGV1780307983454\",\"slot\":45,\"seats\":[B5]}','2026-06-01 16:59:43',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI qua PayOS',0,NULL,NULL),(145,5,45,'CGV1780373534198','/qr/CGV1780373534198.png','{\"code\":\"CGV1780373534198\",\"slot\":45,\"seats\":[C7]}','2026-06-02 11:12:14',180000.00,40000.00,140000.00,'paid','confirmed','Thanh toán vé CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI qua PayOS',0,NULL,NULL),(146,5,45,'CGV1780380991062','/qr/CGV1780380991062.png','{\"code\":\"CGV1780380991062\",\"slot\":45,\"seats\":[B8]}','2026-06-02 13:16:31',120000.00,0.00,120000.00,'paid','confirmed','Thanh toán vé CẢM ƠN NGƯỜI ĐÃ THỨC CÙNG TÔI qua PayOS',0,NULL,NULL),(147,5,50,'CGV1780393669218','/qr/CGV1780393669218.png','{\"code\":\"CGV1780393669218\",\"slot\":50,\"seats\":[G12,G13]}','2026-06-02 16:47:49',290000.00,40000.00,250000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(148,5,50,'CGV1780399710762','/qr/CGV1780399710762.png','{\"code\":\"CGV1780399710762\",\"slot\":50,\"seats\":[F15]}','2026-06-02 18:28:31',146000.00,77000.00,69000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(149,5,50,'CGV1780399800140','/qr/CGV1780399800140.png','{\"code\":\"CGV1780399800140\",\"slot\":50,\"seats\":[D13]}','2026-06-02 18:30:00',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(150,5,50,'CGV1780399918322','/qr/CGV1780399918322.png','{\"code\":\"CGV1780399918322\",\"slot\":50,\"seats\":[G11]}','2026-06-02 18:31:58',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(151,5,50,'CGV1780409115867','/qr/CGV1780409115867.png','{\"code\":\"CGV1780409115867\",\"slot\":50,\"seats\":[G11]}','2026-06-02 21:05:16',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(152,5,50,'CGV1780409291803','/qr/CGV1780409291803.png','{\"code\":\"CGV1780409291803\",\"slot\":50,\"seats\":[F11]}','2026-06-02 21:08:12',96000.00,0.00,96000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(153,5,50,'CGV1780419121240','/qr/CGV1780419121240.png','{\"code\":\"CGV1780419121240\",\"slot\":50,\"seats\":[E7]}','2026-06-02 23:52:01',96000.00,40000.00,56000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(154,5,50,'CGV1780424196458','/qr/CGV1780424196458.png','{\"code\":\"CGV1780424196458\",\"slot\":50,\"seats\":[G11]}','2026-06-03 01:16:36',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(155,5,50,'CGV1780424672086','/qr/CGV1780424672086.png','{\"code\":\"CGV1780424672086\",\"slot\":50,\"seats\":[F10]}','2026-06-03 01:24:32',96000.00,0.00,96000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(156,5,50,'CGV1780424733497','/qr/CGV1780424733497.png','{\"code\":\"CGV1780424733497\",\"slot\":50,\"seats\":[D1]}','2026-06-03 01:25:33',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(157,38,50,'CGV1780425290633','/qr/CGV1780425290633.png','{\"code\":\"CGV1780425290633\",\"slot\":50,\"seats\":[F10]}','2026-06-03 01:34:51',96000.00,0.00,96000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(158,5,50,'CGV1780425535441','/qr/CGV1780425535441.png','{\"code\":\"CGV1780425535441\",\"slot\":50,\"seats\":[E8]}','2026-06-03 01:38:55',96000.00,22880.00,73120.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(159,5,50,'CGV1780470473606','/qr/CGV1780470473606.png','{\"code\":\"CGV1780470473606\",\"slot\":50,\"seats\":[D15]}','2026-06-03 14:07:54',130000.00,65000.00,65000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(160,5,50,'CGV1780470510838','/qr/CGV1780470510838.png','{\"code\":\"CGV1780470510838\",\"slot\":50,\"seats\":[C14]}','2026-06-03 14:08:31',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(161,5,50,'CGV1780470561266','/qr/CGV1780470561266.png','{\"code\":\"CGV1780470561266\",\"slot\":50,\"seats\":[D10]}','2026-06-03 14:09:21',130000.00,65000.00,65000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(162,5,50,'CGV1780470820111','/qr/CGV1780470820111.png','{\"code\":\"CGV1780470820111\",\"slot\":50,\"seats\":[F6]}','2026-06-03 14:13:40',96000.00,0.00,96000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(163,5,50,'CGV1780470868425','/qr/CGV1780470868425.png','{\"code\":\"CGV1780470868425\",\"slot\":50,\"seats\":[D9]}','2026-06-03 14:14:28',130000.00,65000.00,65000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(164,5,50,'CGV1780472036904','/qr/CGV1780472036904.png','{\"code\":\"CGV1780472036904\",\"slot\":50,\"seats\":[D4,D5]}','2026-06-03 14:33:57',160000.00,40000.00,120000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(165,5,50,'CGV1780472105106','/qr/CGV1780472105106.png','{\"code\":\"CGV1780472105106\",\"slot\":50,\"seats\":[E17]}','2026-06-03 14:35:05',96000.00,40000.00,56000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(166,5,50,'CGV1780497514275','/qr/CGV1780497514275.png','{\"code\":\"CGV1780497514275\",\"slot\":50,\"seats\":[D10]}','2026-06-03 21:38:34',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(167,5,50,'CGV1780497546564','/qr/CGV1780497546564.png','{\"code\":\"CGV1780497546564\",\"slot\":50,\"seats\":[D12]}','2026-06-03 21:39:07',80000.00,0.00,80000.00,'paid','confirmed','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(168,5,50,'CGV1780568428890','/qr/CGV1780568428890.png','{\"code\":\"CGV1780568428890\",\"slot\":50,\"seats\":[D16]}','2026-06-04 17:20:29',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(169,5,50,'CGV1780568559524','/qr/CGV1780568559524.png','{\"code\":\"CGV1780568559524\",\"slot\":50,\"seats\":[G15]}','2026-06-04 17:22:40',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(170,5,50,'CGV1780568667848','/qr/CGV1780568667848.png','{\"code\":\"CGV1780568667848\",\"slot\":50,\"seats\":[D11]}','2026-06-04 17:24:28',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(171,5,50,'CGV1780569539738','/qr/CGV1780569539738.png','{\"code\":\"CGV1780569539738\",\"slot\":50,\"seats\":[D13]}','2026-06-04 17:39:00',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(172,5,50,'CGV1780569565363','/qr/CGV1780569565363.png','{\"code\":\"CGV1780569565363\",\"slot\":50,\"seats\":[D16,D17,D18]}','2026-06-04 17:39:25',240000.00,0.00,240000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(173,38,50,'CGV1780569585653','/qr/CGV1780569585653.png','{\"code\":\"CGV1780569585653\",\"slot\":50,\"seats\":[D16]}','2026-06-04 17:39:46',80000.00,0.00,80000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(174,5,50,'CGV1780569853854','/qr/CGV1780569853854.png','{\"code\":\"CGV1780569853854\",\"slot\":50,\"seats\":[C14,D14]}','2026-06-04 17:44:14',160000.00,0.00,160000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(175,5,50,'CGV1780572267853','/qr/CGV1780572267853.png','{\"code\":\"CGV1780572267853\",\"slot\":50,\"seats\":[E13]}','2026-06-04 18:24:28',96000.00,0.00,96000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(176,5,50,'CGV1780572937457','/qr/CGV1780572937457.png','{\"code\":\"CGV1780572937457\",\"slot\":50,\"seats\":[G6]}','2026-06-04 18:35:37',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(177,5,50,'CGV1780573270533','/qr/CGV1780573270533.png','{\"code\":\"CGV1780573270533\",\"slot\":50,\"seats\":[G10,G11]}','2026-06-04 18:41:11',240000.00,0.00,240000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(178,5,50,'CGV1780573557067','/qr/CGV1780573557067.png','{\"code\":\"CGV1780573557067\",\"slot\":50,\"seats\":[E15,F15,G15]}','2026-06-04 18:45:57',312000.00,0.00,312000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(179,5,50,'CGV1780574153443','/qr/CGV1780574153443.png','{\"code\":\"CGV1780574153443\",\"slot\":50,\"seats\":[E15]}','2026-06-04 18:55:53',96000.00,0.00,96000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(180,5,50,'CGV1780574205862','/qr/CGV1780574205862.png','{\"code\":\"CGV1780574205862\",\"slot\":50,\"seats\":[E15]}','2026-06-04 18:56:46',96000.00,0.00,96000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(181,5,50,'CGV1780590764255','/qr/CGV1780590764255.png','{\"code\":\"CGV1780590764255\",\"slot\":50,\"seats\":[G18]}','2026-06-04 23:32:44',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(182,5,50,'CGV1780591220838','/qr/CGV1780591220838.png','{\"code\":\"CGV1780591220838\",\"slot\":50,\"seats\":[G14,G15,G16,G17,G18]}','2026-06-04 23:40:21',600000.00,0.00,600000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(183,5,50,'CGV1780591242031','/qr/CGV1780591242031.png','{\"code\":\"CGV1780591242031\",\"slot\":50,\"seats\":[G14,G15,G16,G17,G18]}','2026-06-04 23:40:42',600000.00,0.00,600000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(184,5,50,'CGV1780591547149','/qr/CGV1780591547149.png','{\"code\":\"CGV1780591547149\",\"slot\":50,\"seats\":[G14,G15,G16,G17,G18]}','2026-06-04 23:45:47',600000.00,0.00,600000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(185,5,50,'CGV1780591609673','/qr/CGV1780591609673.png','{\"code\":\"CGV1780591609673\",\"slot\":50,\"seats\":[F14,F15,F16,F17,F18,G14,G15,G16,G17,G18]}','2026-06-04 23:46:50',1080000.00,0.00,1080000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(186,5,51,'CGV1780592252417','/qr/CGV1780592252417.png','{\"code\":\"CGV1780592252417\",\"slot\":51,\"seats\":[F10]}','2026-06-04 23:57:32',120000.00,0.00,120000.00,'unpaid','cancelled','Thanh toán vé CÔ DÂU! qua PayOS',0,NULL,NULL),(187,5,51,'CGV1780592366881','/qr/CGV1780592366881.png','{\"code\":\"CGV1780592366881\",\"slot\":51,\"seats\":[E10,E9,F10,F9]}','2026-06-04 23:59:27',480000.00,0.00,480000.00,'unpaid','cancelled','Thanh toán vé CÔ DÂU! qua PayOS',0,NULL,NULL),(188,5,51,'CGV1780592446773','/qr/CGV1780592446773.png','{\"code\":\"CGV1780592446773\",\"slot\":51,\"seats\":[D10,E10,F10]}','2026-06-05 00:00:47',360000.00,0.00,360000.00,'paid','confirmed','Thanh toán vé CÔ DÂU! qua PayOS',0,NULL,NULL),(189,5,50,'CGV1780639222058','/qr/CGV1780639222058.png','{\"code\":\"CGV1780639222058\",\"slot\":50,\"seats\":[F12,F13,F14,F15,F16,F17,F18]}','2026-06-05 13:00:22',672000.00,0.00,672000.00,'unpaid','cancelled','Thanh toán vé Doraemon: Nobita and the Sky Utopia qua PayOS',0,NULL,NULL),(190,5,58,'CGV1780694727380','/qr/CGV1780694727380.png','{\"code\":\"CGV1780694727380\",\"slot\":58,\"seats\":[G16,G17,G18]}','2026-06-06 04:25:27',337500.00,0.00,337500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(191,5,58,'CGV1780694841341','/qr/CGV1780694841341.png','{\"code\":\"CGV1780694841341\",\"slot\":58,\"seats\":[F16,F17,F18]}','2026-06-06 04:27:21',270000.00,0.00,270000.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(192,5,58,'CGV1780695118741','/qr/CGV1780695118741.png','{\"code\":\"CGV1780695118741\",\"slot\":58,\"seats\":[G13]}','2026-06-06 04:31:59',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(193,5,58,'CGV1780697177209','/qr/CGV1780697177209.png','{\"code\":\"CGV1780697177209\",\"slot\":58,\"seats\":[G17]}','2026-06-06 05:06:17',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(194,5,58,'CGV1780697896901','/qr/CGV1780697896901.png','{\"code\":\"CGV1780697896901\",\"slot\":58,\"seats\":[G18]}','2026-06-06 05:18:17',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(195,5,58,'CGV1780698719129','/qr/CGV1780698719129.png','{\"code\":\"CGV1780698719129\",\"slot\":58,\"seats\":[G14]}','2026-06-06 05:31:59',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(196,5,58,'CGV1780698953058','/qr/CGV1780698953058.png','{\"code\":\"CGV1780698953058\",\"slot\":58,\"seats\":[D7]}','2026-06-06 05:35:53',75000.00,0.00,75000.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(197,5,58,'CGV1780699023170','/qr/CGV1780699023170.png','{\"code\":\"CGV1780699023170\",\"slot\":58,\"seats\":[G12]}','2026-06-06 05:37:03',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(198,5,58,'CGV1780699060779','/qr/CGV1780699060779.png','{\"code\":\"CGV1780699060779\",\"slot\":58,\"seats\":[G1,G2,G3,G4]}','2026-06-06 05:37:41',450000.00,0.00,450000.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(199,5,58,'CGV1780699254560','/qr/CGV1780699254560.png','{\"code\":\"CGV1780699254560\",\"slot\":58,\"seats\":[F10,F11,F12,F9]}','2026-06-06 05:40:55',360000.00,0.00,360000.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(200,5,58,'CGV1780699560921','/qr/CGV1780699560921.png','{\"code\":\"CGV1780699560921\",\"slot\":58,\"seats\":[A6]}','2026-06-06 05:46:01',75000.00,0.00,75000.00,'paid','confirmed','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL),(201,5,58,'CGV1780702852154','/qr/CGV1780702852154.png','{\"code\":\"CGV1780702852154\",\"slot\":58,\"seats\":[G18]}','2026-06-06 06:40:52',112500.00,0.00,112500.00,'unpaid','cancelled','Thanh toán vé LÚC ĐÓ TÔI ĐÃ CHUYỂN SINH THÀNH SLIME: NƯỚC MẮT ĐẠI DƯƠNG qua PayOS',0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketsdetails`
--

LOCK TABLES `ticketsdetails` WRITE;
/*!40000 ALTER TABLE `ticketsdetails` DISABLE KEYS */;
INSERT INTO `ticketsdetails` VALUES (1,1,1,1,50000.00,50000.00,0),(2,18,4,1,300000.00,300000.00,0),(3,24,1,1,50000.00,50000.00,0),(4,25,1,1,50000.00,50000.00,0),(5,25,3,1,90000.00,90000.00,0),(6,28,1,1,50000.00,50000.00,0),(7,101,3,1,90000.00,90000.00,0),(8,103,1,1,50000.00,50000.00,0),(9,104,2,2,30000.00,60000.00,0),(10,107,3,1,90000.00,90000.00,0),(11,108,2,2,30000.00,60000.00,0),(12,110,3,1,90000.00,90000.00,0),(13,112,1,1,50000.00,50000.00,0),(14,120,1,1,50000.00,50000.00,0),(15,132,1,1,50000.00,50000.00,0),(16,141,1,1,50000.00,50000.00,0),(17,147,1,1,50000.00,50000.00,0),(18,148,1,1,50000.00,50000.00,0),(19,159,1,1,50000.00,50000.00,0),(20,161,1,1,50000.00,50000.00,0),(21,163,1,1,50000.00,50000.00,0);
/*!40000 ALTER TABLE `ticketsdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cinema_cgv'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-06 13:46:55
