-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2026 at 05:11 AM
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
-- Database: `cpdo_lc`
--

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `applicant_name` varchar(255) NOT NULL,
  `applicant_address` text NOT NULL,
  `address_region_code` char(9) DEFAULT NULL,
  `address_province_code` char(9) DEFAULT NULL,
  `address_city_code` char(9) DEFAULT NULL,
  `address_barangay_code` char(9) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `applicant_contact` varchar(255) DEFAULT NULL,
  `applicant_type` enum('individual','corporate') NOT NULL DEFAULT 'individual',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `corporation_address_region_code` varchar(10) DEFAULT NULL,
  `corporation_address_province_code` varchar(10) DEFAULT NULL,
  `corporation_address_city_code` varchar(10) DEFAULT NULL,
  `corporation_address_barangay_code` varchar(10) DEFAULT NULL,
  `corporation_address_street` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_drafts`
--

CREATE TABLE `application_drafts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `current_step` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `completed_steps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`completed_steps`)),
  `has_representative` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `certificate_number` varchar(255) NOT NULL,
  `verification_code` varchar(16) DEFAULT NULL,
  `physical_certificate_number` varchar(255) DEFAULT NULL,
  `ready_for_collection_at` timestamp NULL DEFAULT NULL,
  `ready_for_collection_by` int(10) UNSIGNED DEFAULT NULL,
  `collected_at` timestamp NULL DEFAULT NULL,
  `collected_by_staff` int(10) UNSIGNED DEFAULT NULL,
  `collection_notes` text DEFAULT NULL,
  `is_legacy_certificate` tinyint(1) NOT NULL DEFAULT 0,
  `certificate_file_path` varchar(255) DEFAULT NULL,
  `issued_by` int(10) UNSIGNED DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT NULL,
  `ready_at` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  `released_by` int(10) UNSIGNED DEFAULT NULL,
  `released_to_name` varchar(255) DEFAULT NULL,
  `released_to_id_type` varchar(100) DEFAULT NULL,
  `released_to_id_number` varchar(100) DEFAULT NULL,
  `release_signature_path` varchar(255) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` int(10) UNSIGNED DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `status` enum('preparing','ready_for_pickup','released','cancelled') DEFAULT 'preparing',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_analytics`
--

CREATE TABLE `dashboard_analytics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `metric_type` varchar(50) NOT NULL,
  `total_requests` int(11) NOT NULL DEFAULT 0,
  `pending_requests` int(11) NOT NULL DEFAULT 0,
  `under_review_requests` int(11) NOT NULL DEFAULT 0,
  `approved_requests` int(11) NOT NULL DEFAULT 0,
  `rejected_requests` int(11) NOT NULL DEFAULT 0,
  `completed_requests` int(11) NOT NULL DEFAULT 0,
  `pending_payments` int(11) NOT NULL DEFAULT 0,
  `verified_payments` int(11) NOT NULL DEFAULT 0,
  `rejected_payments` int(11) NOT NULL DEFAULT 0,
  `total_payment_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `preparing_certificates` int(11) NOT NULL DEFAULT 0,
  `ready_certificates` int(11) NOT NULL DEFAULT 0,
  `released_certificates` int(11) NOT NULL DEFAULT 0,
  `requests_by_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requests_by_type`)),
  `requests_by_nature` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requests_by_nature`)),
  `avg_review_time_hours` decimal(8,2) DEFAULT NULL,
  `avg_approval_time_hours` decimal(8,2) DEFAULT NULL,
  `avg_total_time_hours` decimal(8,2) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(10) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `street_address` varchar(500) NOT NULL,
  `house_number` varchar(100) DEFAULT NULL,
  `barangay` varchar(255) NOT NULL,
  `city_municipality` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_10_28_151820_create_corporations_table', 1),
(5, '2025_10_28_151830_create_projects_table', 1),
(6, '2025_10_28_151842_create_applications_table', 1),
(7, '2025_10_28_151904_create_notices_table', 1),
(8, '2025_10_28_151920_create_reports_table', 1),
(9, '2025_10_29_063456_create_requests_table', 1),
(10, '2025_10_30_125331_create_permission_tables', 1),
(11, '2025_10_30_154701_create_payments_table', 1),
(12, '2025_10_30_154702_add_payment_order_fields_to_payments_table', 1),
(13, '2025_10_30_154706_create_certificates_table', 1),
(14, '2025_10_30_154707_add_certificate_collection_fields_to_certificates_table', 1),
(15, '2025_10_30_154709_create_status_history_table', 1),
(16, '2025_10_30_154714_add_workflow_status_to_reports_table', 1),
(17, '2025_10_30_154715_add_submission_deadline_fields_to_requests_table', 1),
(18, '2025_10_30_154716_update_workflow_status_values_in_reports_table', 1),
(19, '2025_10_31_132921_update_date_fields_in_requests_table', 1),
(20, '2025_10_31_132959_update_date_fields_in_projects_table', 1),
(21, '2025_11_08_130227_drop_existing_indexes', 1),
(22, '2025_11_08_130228_add_performance_indexes_to_tables', 1),
(23, '2025_11_08_133211_create_audit_logs_table', 1),
(24, '2025_11_11_000001_create_notifications_table', 1),
(25, '2025_11_11_000002_drop_notices_table', 1),
(26, '2025_11_12_081816_create_reminders_table', 1),
(27, '2026_05_07_160756_cleanup_partial_payment_columns', 1),
(28, '2026_05_08_212945_remove_payment_gateway_features', 1),
(29, '2026_05_08_220333_add_under_review_to_reports_evaluation_enum', 1),
(30, '2026_05_08_220730_add_super_admin_to_user_type_enum', 1),
(31, '2026_07_27_000001_drop_dss_gis_tables', 1),
(32, '2026_07_27_100001_create_document_types_table', 1),
(33, '2026_07_27_100002_create_uploaded_documents_table', 1),
(34, '2026_07_27_100003_create_land_use_information_table', 1),
(35, '2026_07_27_100004_create_evaluations_table', 1),
(36, '2026_07_27_100005_create_certificate_releases_table', 1),
(37, '2026_08_03_000001_create_normalized_applicants_table', 1),
(38, '2026_08_03_000002_create_normalized_corporations_table', 1),
(39, '2026_08_03_000003_create_representatives_table', 1),
(40, '2026_08_03_000004_create_normalized_projects_table', 1),
(41, '2026_08_03_000005_create_properties_table', 1),
(42, '2026_08_03_000006_create_locations_table', 1),
(43, '2026_08_03_000007_update_requests_table_for_normalization', 1),
(44, '2026_08_03_000008_migrate_data_to_normalized_tables', 1),
(45, '2026_08_03_000009_drop_unused_tables', 1),
(46, '2026_08_03_000010_fix_system_flow_gaps', 1),
(47, '2026_08_03_000011_remove_redundant_columns_from_requests', 1),
(48, '2026_08_04_000001_update_certificates_table_for_physical_workflow', 1),
(49, '2026_08_04_215552_add_review_fields_to_reports_table', 1),
(50, '2026_08_12_000001_update_requests_status_column', 1),
(51, '2026_08_13_000001_add_payment_confirmation_indexes', 1),
(52, '2026_08_13_032050_backfill_control_numbers_on_requests', 1),
(53, '2026_08_17_232554_create_sms_templates_table', 1),
(54, '2026_08_18_000001_add_missing_sms_templates', 1),
(55, '2026_08_20_110643_create_requirement_documents_table', 1),
(56, '2026_08_25_000001_add_requirements_submitted_sms_template', 1),
(57, '2026_08_25_100000_update_sms_templates_use_control_number', 1),
(58, '2026_08_26_000001_replace_control_number_with_application_decision_numbers', 1),
(59, '2026_08_26_000002_update_sms_templates_use_application_number', 1),
(60, '2026_08_26_000003_backfill_application_numbers', 1),
(61, '2026_08_27_000001_drop_appointment_fields_from_reports_table', 1),
(62, '2026_08_27_114244_add_verified_requirements_to_requests_table', 1),
(63, '2026_08_28_000001_optimize_payment_and_certificate_workflow', 1),
(64, '2026_08_28_000002_add_system_flow_constraints', 1),
(65, '2026_08_28_000003_comprehensive_database_cleanup', 1),
(66, '2026_08_29_000001_add_signatures_and_reviewer_link', 1),
(67, '2026_08_30_000001_add_certificate_detail_fields_to_properties', 1),
(68, '2026_08_30_000002_add_avatar_path_to_users', 1),
(69, '2026_09_01_000001_add_released_to_applicant_to_requests', 1),
(70, '2026_09_02_000001_add_released_by_to_requests', 1),
(71, '2026_09_02_120000_update_sms_templates_remove_landcert', 1),
(72, '2026_09_02_130000_add_performance_composite_indexes', 1),
(73, '2026_09_02_130001_add_soft_deletes_to_main_tables', 1),
(74, '2026_09_02_130002_create_request_timeline_table', 1),
(75, '2026_09_02_130003_create_system_settings_table', 1),
(76, '2026_09_02_130004_create_dashboard_analytics_table', 1),
(77, '2026_09_06_000001_restore_reminders_table', 1),
(78, '2026_09_08_000001_add_missing_foreign_keys_to_certificates_and_reports', 1),
(79, '2026_09_13_000001_add_unique_receipt_number_to_payments', 1),
(80, '2026_09_13_000002_fix_tenure_of_temporary_use_permits', 1),
(81, '2026_09_15_000001_create_psgc_tables', 1),
(82, '2026_09_15_000002_add_address_parts_to_applicants_and_representatives', 1),
(83, '2026_09_15_000003_fold_psgc_regions_into_provinces', 1),
(84, '2026_09_15_000004_add_address_parts_to_users', 1),
(85, '2026_09_17_000001_add_verification_to_certificates_table', 1),
(86, '2026_09_17_000002_add_processing_time_tracking', 1),
(87, '2026_09_17_000003_add_signature_versions', 1),
(88, '2026_09_17_000004_add_presence_to_users', 1),
(89, '2026_09_20_000001_record_consent_to_the_published_notices', 1),
(90, '2026_09_21_020857_add_corporation_address_fields_to_applicants_table', 1),
(91, '2026_09_21_040402_add_consent_fields_to_users_table', 1),
(92, '2026_09_21_fix_declared_at_column', 1),
(93, '2026_09_25_000001_add_house_number_to_locations', 1),
(94, '2026_09_25_000002_create_application_drafts_table', 1),
(95, '2026_09_26_000001_add_archive_unpaid_after_days_setting', 1),
(96, '2026_09_26_000001_add_current_session_id_to_users', 1),
(97, '2026_09_27_111150_create_push_subscriptions_table', 1),
(98, '2026_09_27_111150_increase_push_subscriptions_endpoint_length', 1),
(99, '2026_09_27_195014_add_integrity_columns_to_requirement_documents_table', 1),
(100, '2026_09_30_233322_add_phone_verified_at_to_users_table', 1),
(101, '2026_09_30_233521_add_denial_count_to_requests_table', 1),
(102, '2026_09_30_233622_add_application_locked_sms_template', 1),
(103, '2026_10_01_002619_backfill_phone_verified_at_for_existing_users', 1),
(104, '2026_10_01_102404_add_online_gateway_fields_to_payments_table', 1),
(105, '2026_10_02_230530_add_fee_category_to_reports_table', 1),
(106, '2026_10_07_100000_create_officer_notices_table', 1),
(107, '2026_10_12_100000_add_sms_to_officer_notices_table', 1),
(108, '2026_10_13_100000_add_sms_fee_to_reports_table', 1),
(109, '2026_10_13_110000_set_zoning_officer_positions', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `normalized_corporations`
--

CREATE TABLE `normalized_corporations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `corporation_name` varchar(255) NOT NULL,
  `corporation_address` text NOT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `tin` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `normalized_projects`
--

CREATE TABLE `normalized_projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `project_type` varchar(255) NOT NULL,
  `project_nature` varchar(255) NOT NULL,
  `project_nature_duration` enum('Permanent','Temporary') DEFAULT NULL,
  `project_nature_years` int(11) DEFAULT NULL,
  `project_cost` decimal(15,2) DEFAULT NULL,
  `project_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `officer_notices`
--

CREATE TABLE `officer_notices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sent_by` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(160) NOT NULL,
  `message` text NOT NULL,
  `is_important` tinyint(1) NOT NULL DEFAULT 0,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recipients`)),
  `via_sms` tinyint(1) NOT NULL DEFAULT 0,
  `sms_sent` smallint(5) UNSIGNED DEFAULT NULL,
  `sms_failed` smallint(5) UNSIGNED DEFAULT NULL,
  `sms_skipped` smallint(5) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `is_legacy_payment` tinyint(1) NOT NULL DEFAULT 0,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash') DEFAULT 'cash',
  `payment_channel` varchar(20) NOT NULL DEFAULT 'manual',
  `gateway_provider` varchar(50) DEFAULT NULL,
  `gateway_reference` varchar(255) DEFAULT NULL,
  `gateway_status` varchar(30) DEFAULT NULL,
  `gateway_paid_at` timestamp NULL DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `receipt_number` varchar(255) DEFAULT NULL,
  `receipt_file_path` varchar(255) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `verified_by` int(10) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `lot_area_sqm` decimal(10,2) DEFAULT NULL,
  `bldg_improvement_sqm` decimal(10,2) DEFAULT NULL,
  `lot_number` varchar(255) DEFAULT NULL,
  `tax_declaration_no` varchar(255) DEFAULT NULL,
  `zone_classification` varchar(255) DEFAULT NULL,
  `title_number` varchar(255) DEFAULT NULL,
  `right_over_land` enum('Owner','Lessee') DEFAULT NULL,
  `existing_land_use` enum('Residential','Institutional','Commercial','Industrial','Tenanted','Vacant','Agricultural','Not Tenanted') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `psgc_barangays`
--

CREATE TABLE `psgc_barangays` (
  `code` char(9) NOT NULL,
  `name` varchar(255) NOT NULL,
  `city_code` char(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `psgc_cities_municipalities`
--

CREATE TABLE `psgc_cities_municipalities` (
  `code` char(9) NOT NULL,
  `name` varchar(255) NOT NULL,
  `province_code` char(9) NOT NULL,
  `is_city` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `psgc_provinces`
--

CREATE TABLE `psgc_provinces` (
  `code` char(9) NOT NULL,
  `name` varchar(255) NOT NULL,
  `region_code` char(9) NOT NULL,
  `region_name` varchar(255) DEFAULT NULL,
  `kind` enum('province','district','standalone') NOT NULL DEFAULT 'province'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscribable_type` varchar(255) NOT NULL,
  `subscribable_id` bigint(20) UNSIGNED NOT NULL,
  `endpoint` varchar(1024) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `public_key` varchar(255) DEFAULT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `content_encoding` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `related_id` bigint(20) UNSIGNED NOT NULL,
  `related_type` varchar(255) NOT NULL,
  `scheduled_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `message` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(10) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `fee_category` varchar(2) DEFAULT NULL,
  `computed_fee` decimal(12,2) DEFAULT NULL,
  `sms_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `admin_notes` text DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `date_certified` date DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `evaluation` enum('pending','approved','rejected','reviewed') DEFAULT NULL,
  `date_reported` datetime DEFAULT NULL,
  `issued_by` varchar(255) DEFAULT NULL,
  `reviewed_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `representatives`
--

CREATE TABLE `representatives` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `representative_name` varchar(255) NOT NULL,
  `representative_address` text NOT NULL,
  `address_region_code` char(9) DEFAULT NULL,
  `address_province_code` char(9) DEFAULT NULL,
  `address_city_code` char(9) DEFAULT NULL,
  `address_barangay_code` char(9) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `representative_email` varchar(255) DEFAULT NULL,
  `representative_contact` varchar(255) DEFAULT NULL,
  `authorization_letter_path` varchar(255) DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `application_number` varchar(255) DEFAULT NULL,
  `decision_number` varchar(255) DEFAULT NULL,
  `has_written_notice` enum('yes','no') DEFAULT NULL,
  `notice_officer_name` varchar(255) DEFAULT NULL,
  `notice_dates` date DEFAULT NULL,
  `has_similar_application` enum('yes','no') DEFAULT NULL,
  `similar_application_offices` text DEFAULT NULL,
  `similar_application_dates` date DEFAULT NULL,
  `preferred_release_mode` enum('pickup','mail_applicant','mail_representative','mail_other') DEFAULT NULL,
  `release_address` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `denial_count` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `stage_since` timestamp NULL DEFAULT NULL,
  `released_to_applicant_at` timestamp NULL DEFAULT NULL,
  `released_by` int(10) UNSIGNED DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_by` int(10) UNSIGNED DEFAULT NULL,
  `submission_deadline` timestamp NULL DEFAULT NULL,
  `submission_deadline_set_by` int(10) UNSIGNED DEFAULT NULL,
  `requirements_submitted_at` timestamp NULL DEFAULT NULL,
  `requirements_submitted_by` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `applicant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `declared_at` timestamp NULL DEFAULT NULL,
  `declaration_version` varchar(16) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `verified_requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verified_requirements`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `request_status_history`
--

CREATE TABLE `request_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(50) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `changed_by` int(10) UNSIGNED DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `request_timeline`
--

CREATE TABLE `request_timeline` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `visible_to_applicant` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requirement_documents`
--

CREATE TABLE `requirement_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` bigint(20) UNSIGNED NOT NULL,
  `requirement_id` int(11) NOT NULL,
  `requirement_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `duplicate_of_id` bigint(20) UNSIGNED DEFAULT NULL,
  `possible_editing_flag` tinyint(1) NOT NULL DEFAULT 0,
  `possible_editing_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signature_versions`
--

CREATE TABLE `signature_versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `signature_path` varchar(255) DEFAULT NULL,
  `position` varchar(150) DEFAULT NULL,
  `effective_from` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `set_by` int(10) UNSIGNED DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_templates`
--

CREATE TABLE `sms_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_key` varchar(255) NOT NULL,
  `event_label` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `variables` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sms_templates`
--

INSERT INTO `sms_templates` (`id`, `event_key`, `event_label`, `message`, `enabled`, `variables`, `created_at`, `updated_at`) VALUES
(1, 'application_submitted', 'Application Submitted', 'Hi {name}! Your application #{application_number} has been submitted. We will review it and notify you of the result. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{email}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(2, 'application_approved', 'Application Approved', 'Good news {name}! Application #{application_number} is APPROVED. Please visit the CPDO office for the next steps. Check your email for payment details. - CPDO LC', 1, '[\"{name}\",\"{application_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(3, 'application_rejected', 'Application Rejected', '{name}, application #{application_number} was REJECTED. Reason: {reason}. Contact CPDO office for details. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{reason}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(4, 'payment_verified', 'Payment Verified', '{name}, payment of PHP {amount} for application #{application_number} is VERIFIED. Your certificate will be prepared. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{amount}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(5, 'payment_rejected', 'Payment Rejected', '{name}, your payment for application #{application_number} was REJECTED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{reason}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(6, 'certificate_preparing', 'Certificate Being Prepared', '{name}, certificate #{cert_number} is being prepared. You will be notified when it is ready for pickup at CPDO. - CPDO LC', 1, '[\"{name}\",\"{cert_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(7, 'certificate_ready', 'Certificate Ready for Pickup', '{name}, certificate #{cert_number} for application #{application_number} is READY for pickup at CPDO office. Bring a valid ID. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{cert_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(8, 'payment_reminder', 'Payment Reminder', 'Reminder: {name}, payment for application #{application_number} is due. Visit CPDO office to complete payment. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{days_remaining}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(9, 'application_reviewed', 'Application Reviewed (Pending Super Admin Approval)', 'Hi {name}! Application #{application_number} has been reviewed by admin and is now pending final approval. You will be notified once fully approved. - CPDO LC', 1, '[\"{name}\",\"{application_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(10, 'application_approved_next_steps', 'Application Approved — Next Steps (Payment Instructions)', 'Hi {name}! Application #{application_number} is APPROVED. Next step: Pay PHP {amount} at the City Treasury Office and bring your Official Receipt to the CPDO office. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{amount}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(11, 'certificate_released', 'Certificate Released / Collected', 'Hi {name}! Your certificate #{cert_number} has been officially released. Thank you for using CPDO LC services. Contact us if you need assistance. - CPDO LC', 1, '[\"{name}\",\"{cert_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(12, 'requirements_submitted', 'Requirements Submitted (Awaiting Review)', 'Hi {name}! Your requirements for application #{application_number} were submitted successfully. Please wait while our staff reviews your application. - CPDO LC', 1, '[\"{name}\",\"{application_number}\"]', '2026-10-22 03:07:07', '2026-10-22 03:07:08'),
(13, 'application_locked', 'Application Permanently Denied', '{name}, application #{application_number} has been denied {max} times and can no longer be resubmitted online. Please visit the CPDO office in person. - CPDO LC', 1, '[\"{name}\",\"{application_number}\",\"{max}\"]', '2026-10-22 03:07:12', '2026-10-22 03:07:12');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `label` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `value` text DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'text',
  `options` text DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `category`, `label`, `description`, `value`, `type`, `options`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'payment_deadline_days', 'Payments', 'Payment Deadline (Days)', 'Number of days applicant has to pay after approval', '30', 'number', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(2, 'certificate_expiry_months', 'Certificates', 'Certificate Validity (Months)', 'How many months until certificate expires', '12', 'number', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(3, 'reminder_days_before_deadline', 'Notifications', 'Payment Reminder Days', 'Send reminder X days before payment deadline', '7,3,1', 'text', NULL, 0, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(4, 'office_hours', 'General', 'Office Hours', 'CPDO office operating hours', 'Monday to Friday, 8:00 AM - 5:00 PM', 'text', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(5, 'contact_email', 'General', 'Contact Email', 'Official CPDO contact email', 'cpdo@ilagan.gov.ph', 'email', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(6, 'contact_phone', 'General', 'Contact Phone', 'Official CPDO contact number', '(078) 123-4567', 'text', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(7, 'max_file_size_mb', 'Uploads', 'Maximum File Size (MB)', 'Maximum file size for document uploads', '10', 'number', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(8, 'allowed_file_types', 'Uploads', 'Allowed File Types', 'Comma-separated list of allowed file extensions', 'pdf,jpg,jpeg,png', 'text', NULL, 1, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(9, 'maintenance_mode', 'System', 'Maintenance Mode', 'Enable to show maintenance page to applicants', 'false', 'boolean', NULL, 0, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(10, 'maintenance_message', 'System', 'Maintenance Message', 'Message shown during maintenance mode', 'System is under maintenance. Please check back later.', 'text', NULL, 0, '2026-10-22 03:07:08', '2026-10-22 03:07:08'),
(11, 'sla_days_verification', 'Certificates', 'Document verification limit (working days)', 'Working days the Zoning Officer has to verify an application\'s documents, per the Citizen\'s Charter.', '3', 'number', NULL, 0, '2026-10-22 03:07:09', '2026-10-22 03:07:09'),
(12, 'sla_days_approval', 'Certificates', 'Approval limit (working days)', 'Working days the Zoning Administrator has to decide a reviewed application.', '2', 'number', NULL, 0, '2026-10-22 03:07:09', '2026-10-22 03:07:09'),
(13, 'sla_days_release', 'Certificates', 'Issuance limit (working days)', 'Working days from a recorded payment to the document being released.', '3', 'number', NULL, 0, '2026-10-22 03:07:09', '2026-10-22 03:07:09'),
(14, 'archive_after_years', 'General', 'Archive closed applications after (years)', 'Released or denied applications untouched for this many years are moved to the archive, off the applications board.', '2', 'number', NULL, 0, '2026-10-22 03:07:09', '2026-10-22 03:07:09'),
(15, 'archive_unpaid_after_days', 'General', 'Archive approved-and-unpaid applications after (days)', 'An application approved by the Zoning Administrator but never paid is moved to the archive, off the applications board, after this many days.', '30', 'number', NULL, 0, '2026-10-22 03:07:12', '2026-10-22 03:07:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `consented_at` timestamp NULL DEFAULT NULL,
  `consent_version` varchar(16) DEFAULT NULL,
  `consent_ip` varchar(45) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `address_region_code` char(9) DEFAULT NULL,
  `address_province_code` char(9) DEFAULT NULL,
  `address_city_code` char(9) DEFAULT NULL,
  `address_barangay_code` char(9) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `user_type` enum('applicant','staff','admin','super_admin') DEFAULT 'applicant',
  `position` varchar(150) DEFAULT NULL,
  `signature_path` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `current_session_id` varchar(100) DEFAULT NULL,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `last_seen_path` varchar(190) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `applicants_user_id_unique` (`user_id`),
  ADD KEY `applicants_applicant_name_index` (`applicant_name`),
  ADD KEY `applicants_applicant_type_index` (`applicant_type`),
  ADD KEY `applicants_deleted_at_index` (`deleted_at`);

--
-- Indexes for table `application_drafts`
--
ALTER TABLE `application_drafts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_drafts_user_id_unique` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_index` (`user_id`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_model_type_index` (`model_type`),
  ADD KEY `audit_logs_model_id_index` (`model_id`),
  ADD KEY `audit_logs_created_at_index` (`created_at`),
  ADD KEY `audit_logs_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificates_certificate_number_unique` (`certificate_number`),
  ADD UNIQUE KEY `certificates_payment_id_unique` (`payment_id`),
  ADD UNIQUE KEY `certificates_verification_code_unique` (`verification_code`),
  ADD KEY `certificates_issued_by_foreign` (`issued_by`),
  ADD KEY `certificates_ready_for_collection_by_foreign` (`ready_for_collection_by`),
  ADD KEY `certificates_collected_by_staff_foreign` (`collected_by_staff`),
  ADD KEY `certificates_physical_certificate_number_index` (`physical_certificate_number`),
  ADD KEY `certificates_ready_for_collection_at_index` (`ready_for_collection_at`),
  ADD KEY `certificates_collected_at_index` (`collected_at`),
  ADD KEY `certificates_issued_at_index` (`issued_at`),
  ADD KEY `certificates_released_by_foreign` (`released_by`),
  ADD KEY `certificates_certificate_number_index` (`certificate_number`),
  ADD KEY `certificates_payment_id_index` (`payment_id`),
  ADD KEY `certificates_status_issued_composite` (`status`,`issued_at`),
  ADD KEY `certificates_user_id_index` (`user_id`),
  ADD KEY `certificates_request_status_composite` (`request_id`,`status`),
  ADD KEY `certificates_deleted_at_index` (`deleted_at`),
  ADD KEY `certificates_revoked_by_foreign` (`revoked_by`);

--
-- Indexes for table `dashboard_analytics`
--
ALTER TABLE `dashboard_analytics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dashboard_analytics_date_metric_type_unique` (`date`,`metric_type`),
  ADD KEY `dashboard_analytics_date_index` (`date`),
  ADD KEY `dashboard_analytics_metric_type_index` (`metric_type`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_request_id_unique` (`request_id`),
  ADD KEY `locations_barangay_index` (`barangay`),
  ADD KEY `locations_city_municipality_index` (`city_municipality`),
  ADD KEY `locations_province_index` (`province`),
  ADD KEY `locations_request_id_index` (`request_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `normalized_corporations`
--
ALTER TABLE `normalized_corporations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `normalized_corporations_applicant_id_unique` (`applicant_id`),
  ADD KEY `normalized_corporations_corporation_name_index` (`corporation_name`),
  ADD KEY `normalized_corporations_applicant_id_index` (`applicant_id`);

--
-- Indexes for table `normalized_projects`
--
ALTER TABLE `normalized_projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `normalized_projects_request_id_unique` (`request_id`),
  ADD KEY `normalized_projects_project_type_index` (`project_type`),
  ADD KEY `normalized_projects_request_id_index` (`request_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_read_created_at_index` (`user_id`,`read`,`created_at`),
  ADD KEY `notifications_user_read_composite` (`user_id`,`read`);

--
-- Indexes for table `officer_notices`
--
ALTER TABLE `officer_notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `officer_notices_sent_by_foreign` (`sent_by`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_receipt_number_unique` (`receipt_number`),
  ADD KEY `payments_verified_by_foreign` (`verified_by`),
  ADD KEY `payments_payment_status_index` (`payment_status`),
  ADD KEY `payments_payment_date_index` (`payment_date`),
  ADD KEY `payments_payment_status_payment_date_index` (`payment_status`,`payment_date`),
  ADD KEY `payments_receipt_number_index` (`receipt_number`),
  ADD KEY `payments_request_id_payment_status_index` (`request_id`,`payment_status`),
  ADD KEY `payments_status_date_composite` (`payment_status`,`payment_date`),
  ADD KEY `payments_request_status_composite` (`request_id`,`payment_status`),
  ADD KEY `payments_user_id_index` (`user_id`),
  ADD KEY `payments_user_date_composite` (`user_id`,`payment_date`),
  ADD KEY `payments_deleted_at_index` (`deleted_at`),
  ADD KEY `payments_gateway_reference_index` (`gateway_reference`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `properties_request_id_unique` (`request_id`),
  ADD KEY `properties_existing_land_use_index` (`existing_land_use`),
  ADD KEY `properties_request_id_index` (`request_id`);

--
-- Indexes for table `psgc_barangays`
--
ALTER TABLE `psgc_barangays`
  ADD PRIMARY KEY (`code`),
  ADD KEY `psgc_barangays_city_code_index` (`city_code`);

--
-- Indexes for table `psgc_cities_municipalities`
--
ALTER TABLE `psgc_cities_municipalities`
  ADD PRIMARY KEY (`code`),
  ADD KEY `psgc_cities_municipalities_province_code_index` (`province_code`);

--
-- Indexes for table `psgc_provinces`
--
ALTER TABLE `psgc_provinces`
  ADD PRIMARY KEY (`code`),
  ADD KEY `psgc_provinces_region_code_index` (`region_code`);

--
-- Indexes for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `push_subscriptions_endpoint_unique` (`endpoint`),
  ADD KEY `push_subscriptions_subscribable_morph_idx` (`subscribable_type`,`subscribable_id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reminders_status_scheduled_at_index` (`status`,`scheduled_at`),
  ADD KEY `reminders_user_id_type_index` (`user_id`,`type`),
  ADD KEY `reminders_related_type_related_id_index` (`related_type`,`related_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `reports_evaluation_index` (`evaluation`),
  ADD KEY `reports_request_id_index` (`request_id`),
  ADD KEY `reports_reviewed_by_index` (`reviewed_by`);

--
-- Indexes for table `representatives`
--
ALTER TABLE `representatives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `representatives_applicant_id_index` (`applicant_id`),
  ADD KEY `representatives_is_primary_index` (`is_primary`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `requests_application_number_unique` (`application_number`),
  ADD UNIQUE KEY `requests_decision_number_unique` (`decision_number`),
  ADD KEY `requests_submission_deadline_set_by_foreign` (`submission_deadline_set_by`),
  ADD KEY `requests_requirements_submitted_by_foreign` (`requirements_submitted_by`),
  ADD KEY `requests_submission_deadline_index` (`submission_deadline`),
  ADD KEY `requests_requirements_submitted_at_index` (`requirements_submitted_at`),
  ADD KEY `requests_status_index` (`status`),
  ADD KEY `requests_created_at_index` (`created_at`),
  ADD KEY `requests_status_created_at_index` (`status`,`created_at`),
  ADD KEY `requests_applicant_id_foreign` (`applicant_id`),
  ADD KEY `requests_application_number_index` (`application_number`),
  ADD KEY `requests_status_created_composite` (`status`,`created_at`),
  ADD KEY `requests_decision_number_index` (`decision_number`),
  ADD KEY `requests_released_by_foreign` (`released_by`),
  ADD KEY `requests_user_status_composite` (`user_id`,`status`),
  ADD KEY `requests_deleted_at_index` (`deleted_at`),
  ADD KEY `requests_archived_by_foreign` (`archived_by`),
  ADD KEY `requests_archived_at_index` (`archived_at`);

--
-- Indexes for table `request_status_history`
--
ALTER TABLE `request_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_status_history_changed_by_foreign` (`changed_by`),
  ADD KEY `request_status_history_request_id_changed_at_index` (`request_id`,`changed_at`),
  ADD KEY `request_status_history_changed_at_index` (`changed_at`);

--
-- Indexes for table `request_timeline`
--
ALTER TABLE `request_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_timeline_user_id_foreign` (`user_id`),
  ADD KEY `request_timeline_request_id_created_at_index` (`request_id`,`created_at`),
  ADD KEY `request_timeline_request_id_event_type_index` (`request_id`,`event_type`),
  ADD KEY `request_timeline_created_at_index` (`created_at`);

--
-- Indexes for table `requirement_documents`
--
ALTER TABLE `requirement_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requirement_documents_request_id_requirement_id_index` (`request_id`,`requirement_id`),
  ADD KEY `requirement_documents_request_id_index` (`request_id`),
  ADD KEY `requirement_documents_duplicate_of_id_foreign` (`duplicate_of_id`),
  ADD KEY `requirement_documents_file_hash_index` (`file_hash`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `signature_versions`
--
ALTER TABLE `signature_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_versions_set_by_foreign` (`set_by`),
  ADD KEY `signature_versions_user_id_effective_from_index` (`user_id`,`effective_from`);

--
-- Indexes for table `sms_templates`
--
ALTER TABLE `sms_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sms_templates_event_key_unique` (`event_key`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_settings_key_unique` (`key`),
  ADD KEY `system_settings_category_index` (`category`),
  ADD KEY `system_settings_is_public_index` (`is_public`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_user_type_index` (`user_type`),
  ADD KEY `users_created_at_index` (`created_at`),
  ADD KEY `users_deleted_at_index` (`deleted_at`),
  ADD KEY `users_last_seen_at_index` (`last_seen_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_drafts`
--
ALTER TABLE `application_drafts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dashboard_analytics`
--
ALTER TABLE `dashboard_analytics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `normalized_corporations`
--
ALTER TABLE `normalized_corporations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `normalized_projects`
--
ALTER TABLE `normalized_projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `officer_notices`
--
ALTER TABLE `officer_notices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `representatives`
--
ALTER TABLE `representatives`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `request_status_history`
--
ALTER TABLE `request_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `request_timeline`
--
ALTER TABLE `request_timeline`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requirement_documents`
--
ALTER TABLE `requirement_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `signature_versions`
--
ALTER TABLE `signature_versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_templates`
--
ALTER TABLE `sms_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applicants`
--
ALTER TABLE `applicants`
  ADD CONSTRAINT `applicants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `application_drafts`
--
ALTER TABLE `application_drafts`
  ADD CONSTRAINT `application_drafts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_collected_by_staff_foreign` FOREIGN KEY (`collected_by_staff`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_issued_by_foreign` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_ready_for_collection_by_foreign` FOREIGN KEY (`ready_for_collection_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_released_by_foreign` FOREIGN KEY (`released_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_revoked_by_foreign` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `normalized_corporations`
--
ALTER TABLE `normalized_corporations`
  ADD CONSTRAINT `normalized_corporations_applicant_id_foreign` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `normalized_projects`
--
ALTER TABLE `normalized_projects`
  ADD CONSTRAINT `normalized_projects_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `officer_notices`
--
ALTER TABLE `officer_notices`
  ADD CONSTRAINT `officer_notices_sent_by_foreign` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `properties_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `reminders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `representatives`
--
ALTER TABLE `representatives`
  ADD CONSTRAINT `representatives_applicant_id_foreign` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_applicant_id_foreign` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requests_archived_by_foreign` FOREIGN KEY (`archived_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_released_by_foreign` FOREIGN KEY (`released_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_requirements_submitted_by_foreign` FOREIGN KEY (`requirements_submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_submission_deadline_set_by_foreign` FOREIGN KEY (`submission_deadline_set_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `request_status_history`
--
ALTER TABLE `request_status_history`
  ADD CONSTRAINT `request_status_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `request_status_history_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `request_timeline`
--
ALTER TABLE `request_timeline`
  ADD CONSTRAINT `request_timeline_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `request_timeline_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `requirement_documents`
--
ALTER TABLE `requirement_documents`
  ADD CONSTRAINT `requirement_documents_duplicate_of_id_foreign` FOREIGN KEY (`duplicate_of_id`) REFERENCES `requirement_documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requirement_documents_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `signature_versions`
--
ALTER TABLE `signature_versions`
  ADD CONSTRAINT `signature_versions_set_by_foreign` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `signature_versions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
