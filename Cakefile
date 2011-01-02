{exec} = require 'child_process'

handleOutput = (error, stdout, stderr) ->
	throw error if error
	console.log stdout if stdout
	console.log stderr if stderr

task 'compile', 'compile coffeescript source code', ->
	exec 'coffee -c .', handleOutput

task 'test', 'run test suite', ->
	invoke 'compile'
	exec 'vows tests/*test.coffee', handleOutput