import inquirer from "inquirer"

async function askQuestions(questionConfig) {
    try {
        const answers = await inquirer.prompt(questionConfig)
        return answers
    } catch (error) {
        if (error.isTtyError) {
            throw new Error('Esse ambiente não suporta a renderização de perguntas')
        } else {
            throw new Error(error)
        }
    }
}

export {
    askQuestions
}