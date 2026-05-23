# Bugfix Requirements Document

## Introduction

The application is experiencing a critical database error where queries fail because the `applications` table does not exist in the database, despite having a migration file and Eloquent model defined. This prevents users from viewing their requests dashboard, as the query attempts to join the non-existent `applications` table with `requests` and `reports` tables to retrieve request status information.

The error occurs in `RequestController` when fetching user requests with their evaluation status from reports. The query uses `applications` as an intermediary join between `requests` and `reports` tables, but fails with `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'cpdo.applications' doesn't exist`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user accesses their requests dashboard THEN the system crashes with error "SQLSTATE[42S02]: Base table or view not found: 1146 Table 'cpdo.applications' doesn't exist"

1.2 WHEN the RequestController executes the query with left joins to applications and reports tables THEN the database returns a table not found error

1.3 WHEN the application attempts to join requests with applications on applicant_name and applicant_address THEN the query fails because the applications table does not exist in the database

### Expected Behavior (Correct)

2.1 WHEN a user accesses their requests dashboard THEN the system SHALL successfully execute the query and display the requests with their status information

2.2 WHEN the RequestController executes the query with left joins to applications and reports tables THEN the database SHALL successfully perform the joins and return the requested data

2.3 WHEN the application attempts to join requests with applications on applicant_name and applicant_address THEN the query SHALL complete successfully because the applications table exists in the database

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the applications table exists and contains data THEN the system SHALL CONTINUE TO correctly join requests with applications and reports to retrieve evaluation status

3.2 WHEN a request has an associated application and report THEN the system SHALL CONTINUE TO return COALESCE(reports.evaluation, requests.status) as the status value

3.3 WHEN a request does not have an associated application or report THEN the system SHALL CONTINUE TO return the request's own status value

3.4 WHEN the query retrieves requests with verified payments and certificates THEN the system SHALL CONTINUE TO correctly map payment and certificate information to each request
