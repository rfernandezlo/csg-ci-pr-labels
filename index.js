const core = require ('@actions/core');
const github = require ('@actions/github');

async function getSHA(inputSHA){
    let sha = github.context.sha;
    core.debug(`sha @${sha}`);
    if (github.context.eventName == 'pull_request') {
      const pull = github.context.payload.pull_request;
      if (pull?.head.sha) {
        sha = pull?.head.sha;
      }
    }
    if (inputSHA) {
      sha = inputSHA;
    }
    core.debug(`return sha @${sha}`);
    return sha;
}

async function removeLabel (octokit,ownership,pr,label){
    try {
        await octokit.rest.issues.removeLabel({
            ...ownership,
            issue_number: pr,
            name: label
        });
    } catch (e) {
        core.warning(`failed removing/adding labels: ${e}`);
    }
}

async function addLabel (octokit,ownership,pr,label){
    try {
        await octokit.rest.issues.addLabels({
            ...ownership,
            issue_number: pr,
            labels: [label],
        });
    } catch (e) {
        core.warning(`failed adding labels: ${e}`);
    }
}

const main = async () => {
    try {
        const r_token = await getSHA(core.getInput('token', { required: true }));
        const octokit = new github.getOctokit(r_token);
        const ownership = {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        };
        const r_pr = core.getInput('pull_request', {required: false});
        const r_label = core.getInput('label', {required: false});
        const r_labeld= core.getInput('label_remove', {required: false});
        if (r_label!= null){
            await addLabel(octokit,ownership,r_pr,r_label);
        }
        if (r_labeld != null){
            await removeLabel(octokit,ownership,r_pr,r_labeld);
        }        
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
