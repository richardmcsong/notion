terraform {
  backend "gcs" {
    bucket = "rmcs-notion-tfstate"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.19.0"
    }
  }
}

provider "google" {
  project = "rmcs-notion"
  region  = "us-west1"
}

import {
  id = "projects/rmcs-notion/locations/us-west1/jobs/notion-integration"
  to = google_cloud_run_v2_job.notion
}

resource "google_cloud_run_v2_job" "notion" {
  name     = "notion-integration"
  location = "us-west1"
  template {
    template {
      containers {
        image = "gcr.io/rmcs-notion/notion"
        env {
          name = "NOTION_TOKEN"
          value_source {
            secret_key_ref {
              secret  = "notion_api_key"
              version = "latest"
            }
          }
        }
        env {
          name  = "DEFERRED_TASKS_DASHBOARD_ID"
          value = "05aafb48-7c2f-48ee-9983-16a7698919cd"
        }
      }
    }
  }
}
data "google_project" "notion" {
  project_id = "rmcs-notion"
}

resource "google_cloud_scheduler_job" "notion" {
  name        = "notion-integration"
  schedule    = "0 0 * * *"
  time_zone   = "America/Toronto"
  description = "Run the Notion integration every day at midnight"
  http_target {
    http_method = "POST"
    uri         = "https://${google_cloud_run_v2_job.notion.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${data.google_project.notion.number}/jobs/${google_cloud_run_v2_job.notion.name}:run"
    oauth_token {
      service_account_email = "${data.google_project.notion.number}-compute@developer.gserviceaccount.com"
    }
  }

}
