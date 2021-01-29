from flask_oidc import OpenIDConnect
from flask import Flask, json, g, request
from app.sbData.service import Service as sbData
from app.sbData.schema import GithubRepoSchema
from flask_cors import CORS

app = Flask(__name__)
app.config.update({
  'OIDC_CLIENT_SECRETS': './client_secrets.json',
  'OIDC_RESOURCE_SERVER_ONLY': True
})
oidc = OpenIDConnect(app)
CORS(app)

@app.route("/sbDatas", methods=["GET"])
@oidc.accept_token(True)
def index():
  return json_response(sbData(g.oidc_token_info['sub']).find_all_sbDatas())


@app.route("/sbDatas", methods=["POST"])
@oidc.accept_token(True)
def create():
  github_repo = GithubRepoSchema().load(json.loads(request.data))

  if github_repo.errors:
    return json_response({'error': github_repo.errors}, 422)

  sbData = sbData(g.oidc_token_info['sub']).create_sbData_for(github_repo)
  return json_response(sbData)


@app.route("/sbData/<int:repo_id>", methods=["GET"])
@oidc.accept_token(True)
def show(repo_id):
  sbData = sbData(g.oidc_token_info['sub']).find_sbData(repo_id)

  if sbData:
    return json_response(sbData)
  else:
    return json_response({'error': 'sbData not found'}, 404)


@app.route("/sbData/<int:repo_id>", methods=["PUT"])
@oidc.accept_token(True)
def update(repo_id):
  github_repo = GithubRepoSchema().load(json.loads(request.data))

  if github_repo.errors:
    return json_response({'error': github_repo.errors}, 422)

  sbData_service = sbData(g.oidc_token_info['sub'])
  if sbData_service.update_sbData_with(repo_id, github_repo):
    return json_response(github_repo.data)
  else:
    return json_response({'error': 'sbData not found'}, 404)


@app.route("/sbData/<int:repo_id>", methods=["DELETE"])
@oidc.accept_token(True)
def delete(repo_id):
  sbData_service = sbData(g.oidc_token_info['sub'])
  if sbData_service.delete_sbData_for(repo_id):
    return json_response({})
  else:
    return json_response({'error': 'sbData not found'}, 404)


def json_response(payload, status=200):
  return (json.dumps(payload), status, {'content-type': 'application/json'})
