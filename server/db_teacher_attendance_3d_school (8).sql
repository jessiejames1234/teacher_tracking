-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 28, 2025 at 03:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_teacher_attendance_3d_school`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_archives`
--

CREATE TABLE `tbl_archives` (
  `archive_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11) NOT NULL,
  `archived_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`archived_data`)),
  `archived_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attendance_audit`
--

CREATE TABLE `tbl_attendance_audit` (
  `audit_id` int(11) NOT NULL,
  `attendance_id` int(11) NOT NULL,
  `modified_by` int(11) NOT NULL,
  `old_flag_in` int(11) DEFAULT NULL,
  `new_flag_in` int(11) DEFAULT NULL,
  `old_flag_out` int(11) DEFAULT NULL,
  `new_flag_out` int(11) DEFAULT NULL,
  `change_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attendance_records`
--

CREATE TABLE `tbl_attendance_records` (
  `attendance_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` datetime DEFAULT NULL,
  `latitude_in` decimal(20,7) DEFAULT NULL,
  `longitude_in` decimal(20,7) DEFAULT NULL,
  `flag_in_id` int(11) NOT NULL DEFAULT 1,
  `time_check` datetime DEFAULT NULL,
  `latitude_check` decimal(20,7) DEFAULT NULL,
  `longitude_check` decimal(20,7) DEFAULT NULL,
  `flag_check_id` int(11) NOT NULL DEFAULT 1,
  `time_out` datetime DEFAULT NULL,
  `latitude_out` decimal(20,7) DEFAULT NULL,
  `longitude_out` decimal(20,7) DEFAULT NULL,
  `flag_out_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_attendance_records`
--

INSERT INTO `tbl_attendance_records` (`attendance_id`, `user_id`, `schedule_id`, `room_id`, `date`, `time_in`, `latitude_in`, `longitude_in`, `flag_in_id`, `time_check`, `latitude_check`, `longitude_check`, `flag_check_id`, `time_out`, `latitude_out`, `longitude_out`, `flag_out_id`) VALUES
(1, 6, 1, 1, '2025-11-20', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-05 09:08:00', NULL, NULL, 3),
(2, 6, 1, 1, '2025-11-27', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-05 09:08:00', NULL, NULL, 3),
(3, 6, 1, 1, '2025-12-04', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-05 09:08:00', NULL, NULL, 3),
(4, 6, 1, 1, '2025-12-11', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(5, 6, 2, 1, '2025-12-05', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-11 15:03:00', NULL, NULL, 3),
(6, 6, 3, 3, '2025-12-05', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-05 09:08:00', NULL, NULL, 3),
(7, 6, 4, 2, '2025-12-05', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, '2025-12-05 09:13:00', NULL, NULL, 3),
(8, 6, 2, 1, '2025-12-12', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(9, 6, 3, 3, '2025-12-12', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(10, 6, 4, 2, '2025-12-12', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(11, 6, 1, 1, '2025-12-18', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(12, 6, 2, 1, '2025-12-19', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(13, 6, 3, 3, '2025-12-19', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(14, 6, 4, 2, '2025-12-19', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(15, 6, 1, 1, '2025-12-25', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(16, 6, 2, 1, '2025-12-26', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(17, 6, 3, 3, '2025-12-26', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(19, 6, 1, 1, '2026-01-01', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(20, 6, 5, 2, '2025-12-26', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(22, 6, 6, 4, '2025-12-26', '2025-12-26 16:38:11', 8.4700117, 124.6343779, 2, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(24, 6, 4, 2, '2025-12-26', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(25, 6, 2, 1, '2026-01-02', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(26, 6, 3, 3, '2026-01-02', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(27, 6, 4, 2, '2026-01-02', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(28, 6, 5, 2, '2026-01-02', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(29, 6, 6, 4, '2026-01-02', NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1),
(30, 6, 7, 3, '2025-12-28', '2025-12-28 21:28:22', 8.4699699, 124.6343702, 2, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(32, 6, 9, 3, '2025-12-28', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(34, 6, 8, 3, '2025-12-28', NULL, NULL, NULL, 3, NULL, NULL, NULL, 3, NULL, NULL, NULL, 3),
(35, 6, 10, 3, '2025-12-28', '2025-12-28 22:41:54', 8.4699558, 124.6343653, 5, '2025-12-28 22:42:03', 8.4699572, 124.6343720, 5, '2025-12-28 22:42:05', 8.4699572, 124.6343720, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_buildings`
--

CREATE TABLE `tbl_buildings` (
  `building_id` int(11) NOT NULL,
  `building_name` varchar(100) NOT NULL,
  `location_description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_buildings`
--

INSERT INTO `tbl_buildings` (`building_id`, `building_name`, `location_description`) VALUES
(1, 'sdsa', 'das'),
(2, 'dsa', 'asd');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_class_schedules`
--

CREATE TABLE `tbl_class_schedules` (
  `schedule_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `offering_id` int(11) NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_class_schedules`
--

INSERT INTO `tbl_class_schedules` (`schedule_id`, `room_id`, `offering_id`, `day_of_week`, `start_time`, `end_time`) VALUES
(1, 1, 1, 'thursday', '21:11:00', '22:11:00'),
(2, 1, 1, 'friday', '08:19:00', '09:59:00'),
(3, 3, 1, 'friday', '08:27:00', '09:00:00'),
(4, 2, 1, 'friday', '09:10:00', '09:11:00'),
(5, 2, 1, 'friday', '21:25:00', '22:25:00'),
(6, 4, 1, 'friday', '16:30:00', '17:30:00'),
(7, 3, 1, 'sunday', '21:30:00', '22:30:00'),
(8, 3, 1, 'sunday', '00:00:00', '00:00:00'),
(9, 3, 1, 'sunday', '00:00:00', '00:00:00'),
(10, 3, 1, 'sunday', '22:41:00', '23:41:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_departments`
--

CREATE TABLE `tbl_departments` (
  `dept_id` int(11) NOT NULL,
  `dean_id` int(11) NOT NULL,
  `dept_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_departments`
--

INSERT INTO `tbl_departments` (`dept_id`, `dean_id`, `dept_name`) VALUES
(1, 3, 'sample_department\r\n');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_flag_types`
--

CREATE TABLE `tbl_flag_types` (
  `flag_id` int(11) NOT NULL,
  `flag_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_flag_types`
--

INSERT INTO `tbl_flag_types` (`flag_id`, `flag_name`) VALUES
(1, 'NA'),
(2, 'present'),
(3, 'absent'),
(4, 'excuse'),
(5, 'late');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_floors`
--

CREATE TABLE `tbl_floors` (
  `floor_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `floor_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_floors`
--

INSERT INTO `tbl_floors` (`floor_id`, `building_id`, `floor_number`) VALUES
(1, 1, 1),
(2, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_leave_requests`
--

CREATE TABLE `tbl_leave_requests` (
  `leave_id` int(11) NOT NULL,
  `approved_by` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `date_from` date NOT NULL,
  `date_to` date NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_leave_type`
--

CREATE TABLE `tbl_leave_type` (
  `leave_type_id` int(11) NOT NULL,
  `name_type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notifications`
--

CREATE TABLE `tbl_notifications` (
  `notif_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `type` enum('info','warning','alert') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_penalties`
--

CREATE TABLE `tbl_penalties` (
  `sanction_id` int(11) NOT NULL,
  `issued_by` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_penalties_type`
--

CREATE TABLE `tbl_penalties_type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_programs`
--

CREATE TABLE `tbl_programs` (
  `program_id` int(11) NOT NULL,
  `head_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `program_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_programs`
--

INSERT INTO `tbl_programs` (`program_id`, `head_id`, `dept_id`, `program_name`) VALUES
(1, 4, 1, 'BSIT');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_reports`
--

CREATE TABLE `tbl_reports` (
  `report_id` int(11) NOT NULL,
  `generated_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_roles`
--

CREATE TABLE `tbl_roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_roles`
--

INSERT INTO `tbl_roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'dean'),
(3, 'program_head'),
(4, 'secretary'),
(5, 'teacher');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_rooms`
--

CREATE TABLE `tbl_rooms` (
  `room_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `latitude` decimal(20,7) NOT NULL,
  `longitude` decimal(20,7) NOT NULL,
  `radius` int(10) NOT NULL DEFAULT 10,
  `room_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_rooms`
--

INSERT INTO `tbl_rooms` (`room_id`, `building_id`, `floor_id`, `latitude`, `longitude`, `radius`, `room_name`) VALUES
(1, 1, 1, 200.3000000, 200.3000000, 10, 'dsad'),
(2, 2, 2, 231.0000000, 21.0000000, 10, 'dsa'),
(3, 2, 2, 8.4699560, 124.6343800, 15, 'room idk'),
(4, 2, 2, 8.4700150, 124.6343750, 2, 'room41');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sections`
--

CREATE TABLE `tbl_sections` (
  `section_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL,
  `section_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_sections`
--

INSERT INTO `tbl_sections` (`section_id`, `program_id`, `year_id`, `section_name`) VALUES
(1, 1, 1, 'BSITE1-01');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_semesters`
--

CREATE TABLE `tbl_semesters` (
  `semester_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `term` enum('1st sem','2nd sem') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_semesters`
--

INSERT INTO `tbl_semesters` (`semester_id`, `session_id`, `term`, `start_date`, `end_date`) VALUES
(1, 1, '2nd sem', '2025-11-17', '2026-03-24');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

CREATE TABLE `tbl_sessions` (
  `session_id` int(11) NOT NULL,
  `session_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_sessions`
--

INSERT INTO `tbl_sessions` (`session_id`, `session_name`) VALUES
(1, '2025-2026');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status`
--

CREATE TABLE `tbl_status` (
  `status_id` int(11) NOT NULL,
  `status_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_subject`
--

CREATE TABLE `tbl_subject` (
  `subject_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `units` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_subject`
--

INSERT INTO `tbl_subject` (`subject_id`, `program_id`, `subject_code`, `subject_name`, `units`) VALUES
(1, 1, 'ITE202', 'SAMPLE_NAME (PROGRAMMING1)', 7);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_subject_offerings`
--

CREATE TABLE `tbl_subject_offerings` (
  `offering_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_subject_offerings`
--

INSERT INTO `tbl_subject_offerings` (`offering_id`, `semester_id`, `section_id`, `subject_id`, `user_id`) VALUES
(1, 1, 1, 1, 6);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_substitutions`
--

CREATE TABLE `tbl_substitutions` (
  `substitution_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `substitute_user_id` int(11) NOT NULL,
  `absent_user_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_system_logs`
--

CREATE TABLE `tbl_system_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  `ip_address` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `id_number` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` longblob NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `contact_no` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `role_id`, `status`, `first_name`, `last_name`, `id_number`, `email`, `image`, `password_hash`, `contact_no`) VALUES
(1, 1, 1, 'admin1', 'admin1', '', 'admin@phinmaed.com', '', '$2b$10$XaD0ymslHR8EG6hWpm9ZxeKOZAaJEfu2dfrOfiVUYO5r2mNaKJ1Y.', '0923123'),
(2, 1, 1, 'admin2', 'admin2', '', 'admin2@phinmaed.com', '', '$2b$10$fpUfawvNeq/CIdD8WqGL2ucRjC2/zFb6HZJRape.VA4zJstQqCUlS', '09321312'),
(3, 2, 1, 'dean1', 'dean1', '', 'dean1@phinmaed.com', '', '$2b$10$dG6kDm/sbYi3wvso2KL9g.VR.Bl4IiOM.oZl968iSVgs1PB164h82', '1231'),
(4, 3, 1, 'program_head1', 'program_head1', '', 'program_head1@phinmaed.com', '', '$2b$10$jhFeuNenup.E0OqXuUX1XOIuNou1WMYRwijAfcTBkd78JaKg91qpa', '1234'),
(5, 4, 1, 'secretary1', 'secretary1', '', 'secretary1@phinmaed.com', '', '$2b$10$v/oBIomjz9g6fbRSzsCPXe1HlfcJ2namx/IRkTzQ.keU/ha/FIqrq', '1234'),
(6, 5, 1, 'teacher1', 'teacher1', '', 'teacher1@phinmaed.com', '', '$2b$10$8fAsjYE5/S929lJQK0mj4.zFelMQ1Xw1pVSn/dXeGJDQt60afT5lu', '1234'),
(7, 1, 1, 'dsa', 'dsa', '', 'sad@das', '', '$2b$10$0c8C58AnWA1.P77XNO4x7OlgsSo1H85Qc9HNdo.VZ7RF/f/QfQrMy', 'sd'),
(8, 1, 1, 'dsad', 'asda', '', 'adm21@gmail.com', '', '$2b$10$yB3zZRiBI8ocoUk4KL81/ufzSysqCPe52sReh2JjIaIVL1OCCGcL6', 'dasd'),
(9, 1, 1, 'try1', 'try1', '', 'try1@dsa', '', '$2b$10$fbPRiTvY.wV88kIpL7LGzefBJ9PQL3Zmob8JfPSulXIj6wGiaZzGW', 'try1'),
(10, 1, 1, 'try2', 'try2', '', 'try2@dsad', '', '$2b$10$yAMFHIfYy3KvVV5Z0bpshu1d1lhvLVrS1eQtWwAu1x9JAVXPoVcVe', 'try2'),
(11, 1, 1, 'try3', 'try3', '', 'try3@dasda', '', '$2b$10$j5J7TTYyFxR48fU.WiaPIe9.TLL4PCt3XdyLDdkwe1fezYQMRPHL2', 'try3');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_year_level`
--

CREATE TABLE `tbl_year_level` (
  `year_id` int(11) NOT NULL,
  `level` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_year_level`
--

INSERT INTO `tbl_year_level` (`year_id`, `level`) VALUES
(1, '1st year');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  ADD PRIMARY KEY (`archive_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `attendance_id` (`attendance_id`),
  ADD KEY `modified_by` (`modified_by`);

--
-- Indexes for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `flag_in_id` (`flag_in_id`),
  ADD KEY `flag_check_id` (`flag_check_id`),
  ADD KEY `flag_out_id` (`flag_out_id`);

--
-- Indexes for table `tbl_buildings`
--
ALTER TABLE `tbl_buildings`
  ADD PRIMARY KEY (`building_id`);

--
-- Indexes for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `offering_id` (`offering_id`);

--
-- Indexes for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  ADD PRIMARY KEY (`dept_id`),
  ADD KEY `dean_id` (`dean_id`);

--
-- Indexes for table `tbl_flag_types`
--
ALTER TABLE `tbl_flag_types`
  ADD PRIMARY KEY (`flag_id`);

--
-- Indexes for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  ADD PRIMARY KEY (`floor_id`),
  ADD KEY `building_id` (`building_id`);

--
-- Indexes for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `tbl_leave_type`
--
ALTER TABLE `tbl_leave_type`
  ADD PRIMARY KEY (`leave_type_id`);

--
-- Indexes for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD PRIMARY KEY (`notif_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  ADD PRIMARY KEY (`sanction_id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_penalties_type`
--
ALTER TABLE `tbl_penalties_type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  ADD PRIMARY KEY (`program_id`),
  ADD KEY `dept_id` (`dept_id`),
  ADD KEY `head_id` (`head_id`);

--
-- Indexes for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `generated_by` (`generated_by`);

--
-- Indexes for table `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `building_id` (`building_id`),
  ADD KEY `floor_id` (`floor_id`);

--
-- Indexes for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `year_id` (`year_id`);

--
-- Indexes for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  ADD PRIMARY KEY (`semester_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `tbl_status`
--
ALTER TABLE `tbl_status`
  ADD PRIMARY KEY (`status_id`);

--
-- Indexes for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  ADD PRIMARY KEY (`offering_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  ADD PRIMARY KEY (`substitution_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `substitute_user_id` (`substitute_user_id`),
  ADD KEY `absent_user_id` (`absent_user_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `tbl_year_level`
--
ALTER TABLE `tbl_year_level`
  ADD PRIMARY KEY (`year_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  MODIFY `archive_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `tbl_buildings`
--
ALTER TABLE `tbl_buildings`
  MODIFY `building_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_flag_types`
--
ALTER TABLE `tbl_flag_types`
  MODIFY `flag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  MODIFY `floor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_leave_type`
--
ALTER TABLE `tbl_leave_type`
  MODIFY `leave_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  MODIFY `notif_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  MODIFY `sanction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_penalties_type`
--
ALTER TABLE `tbl_penalties_type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_roles`
--
ALTER TABLE `tbl_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_status`
--
ALTER TABLE `tbl_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  MODIFY `offering_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  MODIFY `substitution_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tbl_year_level`
--
ALTER TABLE `tbl_year_level`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_archives`
--
ALTER TABLE `tbl_archives`
  ADD CONSTRAINT `tbl_archives_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_attendance_audit`
--
ALTER TABLE `tbl_attendance_audit`
  ADD CONSTRAINT `tbl_attendance_audit_ibfk_1` FOREIGN KEY (`attendance_id`) REFERENCES `tbl_attendance_records` (`attendance_id`),
  ADD CONSTRAINT `tbl_attendance_audit_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_attendance_records`
--
ALTER TABLE `tbl_attendance_records`
  ADD CONSTRAINT `tbl_attendance_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `tbl_class_schedules` (`schedule_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `tbl_rooms` (`room_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_4` FOREIGN KEY (`flag_in_id`) REFERENCES `tbl_flag_types` (`flag_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_5` FOREIGN KEY (`flag_check_id`) REFERENCES `tbl_flag_types` (`flag_id`),
  ADD CONSTRAINT `tbl_attendance_records_ibfk_6` FOREIGN KEY (`flag_out_id`) REFERENCES `tbl_flag_types` (`flag_id`);

--
-- Constraints for table `tbl_class_schedules`
--
ALTER TABLE `tbl_class_schedules`
  ADD CONSTRAINT `tbl_class_schedules_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `tbl_rooms` (`room_id`),
  ADD CONSTRAINT `tbl_class_schedules_ibfk_2` FOREIGN KEY (`offering_id`) REFERENCES `tbl_subject_offerings` (`offering_id`);

--
-- Constraints for table `tbl_departments`
--
ALTER TABLE `tbl_departments`
  ADD CONSTRAINT `tbl_departments_ibfk_1` FOREIGN KEY (`dean_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_floors`
--
ALTER TABLE `tbl_floors`
  ADD CONSTRAINT `tbl_floors_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `tbl_buildings` (`building_id`);

--
-- Constraints for table `tbl_leave_requests`
--
ALTER TABLE `tbl_leave_requests`
  ADD CONSTRAINT `tbl_leave_requests_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`),
  ADD CONSTRAINT `tbl_leave_requests_ibfk_4` FOREIGN KEY (`leave_type_id`) REFERENCES `tbl_leave_type` (`leave_type_id`);

--
-- Constraints for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD CONSTRAINT `tbl_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_notifications_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_penalties`
--
ALTER TABLE `tbl_penalties`
  ADD CONSTRAINT `tbl_penalties_ibfk_1` FOREIGN KEY (`issued_by`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_3` FOREIGN KEY (`type_id`) REFERENCES `tbl_penalties_type` (`type_id`),
  ADD CONSTRAINT `tbl_penalties_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_programs`
--
ALTER TABLE `tbl_programs`
  ADD CONSTRAINT `tbl_programs_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `tbl_departments` (`dept_id`),
  ADD CONSTRAINT `tbl_programs_ibfk_2` FOREIGN KEY (`head_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD CONSTRAINT `tbl_reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_rooms`
--
ALTER TABLE `tbl_rooms`
  ADD CONSTRAINT `tbl_rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `tbl_buildings` (`building_id`),
  ADD CONSTRAINT `tbl_rooms_ibfk_2` FOREIGN KEY (`floor_id`) REFERENCES `tbl_floors` (`floor_id`);

--
-- Constraints for table `tbl_sections`
--
ALTER TABLE `tbl_sections`
  ADD CONSTRAINT `tbl_sections_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `tbl_programs` (`program_id`),
  ADD CONSTRAINT `tbl_sections_ibfk_2` FOREIGN KEY (`year_id`) REFERENCES `tbl_year_level` (`year_id`);

--
-- Constraints for table `tbl_semesters`
--
ALTER TABLE `tbl_semesters`
  ADD CONSTRAINT `tbl_semesters_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `tbl_sessions` (`session_id`);

--
-- Constraints for table `tbl_subject`
--
ALTER TABLE `tbl_subject`
  ADD CONSTRAINT `tbl_subject_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `tbl_programs` (`program_id`);

--
-- Constraints for table `tbl_subject_offerings`
--
ALTER TABLE `tbl_subject_offerings`
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `tbl_semesters` (`semester_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `tbl_sections` (`section_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `tbl_subject` (`subject_id`),
  ADD CONSTRAINT `tbl_subject_offerings_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_substitutions`
--
ALTER TABLE `tbl_substitutions`
  ADD CONSTRAINT `tbl_substitutions_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `tbl_class_schedules` (`schedule_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_2` FOREIGN KEY (`substitute_user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_3` FOREIGN KEY (`absent_user_id`) REFERENCES `tbl_users` (`user_id`),
  ADD CONSTRAINT `tbl_substitutions_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `tbl_status` (`status_id`);

--
-- Constraints for table `tbl_system_logs`
--
ALTER TABLE `tbl_system_logs`
  ADD CONSTRAINT `tbl_system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `tbl_users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `tbl_roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
