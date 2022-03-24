import chalk from 'chalk'

function applyUI(content, args) {
    if (!Array.isArray(args)) args = [args].filter(x => x !== null)

    if (args && args.length > 0) {
        args.forEach(item => {
            content = chalk[item](content) 
        })
        return content
    }

    return content
}

function drawLine(withMargin = true, ...args) {
    const margin = withMargin ? '\n' : ''
    const line = applyUI(margin + '-'.repeat(process.stdout.columns) + margin, args)
    console.log(line)
}

function drawText(text, ...args) {
    const line = applyUI(text, args)
    console.log(line)
}

function drawCenteredText(text, ...args) {
    if (!text) {
        throw new Error('O texto é necessário')
    }

    const size = (process.stdout.columns / 2) - Math.ceil((text.length / 2))
    const line = ' '.repeat(size)
    const centeredText = line + text + line

    console.log(applyUI(centeredText, args)) 
}

export {
    drawLine,
    drawText,
    drawCenteredText
}