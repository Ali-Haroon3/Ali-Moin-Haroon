import os
import requests
import yaml

githubToken = os.environ["GITHUB_TOKEN"]
projectId = os.environ["KANBAN_PROJECT_ID"]
repoFull = os.environ["GITHUB_REPOSITORY"]  # e.g. "Ali-Haroon3/Ali-Moin-Haroon"

graphqlHeaders = {
    "Authorization": f"bearer {githubToken}",
    "Content-Type": "application/json"
}
restHeaders = {
    "Authorization": f"Bearer {githubToken}",
    "Accept": "application/vnd.github+json"
}


def runGraphql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    res = requests.post("https://api.github.com/graphql",
                        json=payload, headers=graphqlHeaders)
    res.raise_for_status()
    data = res.json()
    if "errors" in data:
        raise Exception(data["errors"])
    return data["data"]


def loadBoardConfig():
    with open("kanbanConfig.yml", "r") as f:
        return yaml.safe_load(f)


def getStatusField():
    query = """
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
    """
    data = runGraphql(query, {"projectId": projectId})
    fields = data["node"]["fields"]["nodes"]
    statusFieldId = None
    statusOptionsByName = {}

    for field in fields:
        if field and field["name"] == "Status":
            statusFieldId = field["id"]
            for opt in field["options"]:
                statusOptionsByName[opt["name"]] = opt["id"]

    if not statusFieldId:
        raise RuntimeError("Status field not found on project")

    return statusFieldId, statusOptionsByName


def createIssue(title, labels):
    url = f"https://api.github.com/repos/{repoFull}/issues"
    res = requests.post(url, headers=restHeaders,
                        json={"title": title, "labels": labels})
    res.raise_for_status()
    issue = res.json()
    return issue["node_id"]  # GraphQL node id


def addIssueToProject(issueNodeId):
    mutation = """
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item { id }
      }
    }
    """
    data = runGraphql(mutation, {
        "projectId": projectId,
        "contentId": issueNodeId
    })
    return data["addProjectV2ItemById"]["item"]["id"]


def setStatusForItem(itemId, statusFieldId, optionId):
    mutation = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item { id }
      }
    }
    """
    runGraphql(mutation, {
        "projectId": projectId,
        "itemId": itemId,
        "fieldId": statusFieldId,
        "optionId": optionId
    })


def main():
    boardConfig = loadBoardConfig()
    statusFieldId, statusOptionsByName = getStatusField()

    for column in boardConfig["columns"]:
        statusName = column["name"]
        if statusName not in statusOptionsByName:
            raise RuntimeError(f"Status '{statusName}' not defined on project")
        statusOptionId = statusOptionsByName[statusName]

        for issueData in column["issues"]:
            title = issueData["title"]
            labels = issueData.get("labels", [])
            print(f"Creating issue '{title}' with status '{statusName}'")

            issueNodeId = createIssue(title, labels)
            itemId = addIssueToProject(issueNodeId)
            setStatusForItem(itemId, statusFieldId, statusOptionId)


if __name__ == "__main__":
    main()
