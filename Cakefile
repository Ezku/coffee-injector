{exec} = require 'child_process'

handleOutput = (error, stdout, stderr) ->
	throw error if error
	console.log stdout if stdout
	console.log stderr if stderr

task 'compile', 'compile coffeescript source code', ->
	exec 'coffee -c container.coffee', handleOutput

task 'test', 'run test suite', ->
	invoke 'compile'
	exec 'node_modules/.bin/vows tests/*test.coffee', handleOutput
