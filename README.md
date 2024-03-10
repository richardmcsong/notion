# notion

Holds code for notion integrations

## Bootstrapping
Place Notion API secret inside of Google Secrets Manager.


## Manually build on local
- `pack build notion --builder gcr.io/buildpacks/builder:v1`
- `docker run $(vals env -f env.yaml | sed 's/\(.*\)/-e \1/g' | xargs echo) notion`