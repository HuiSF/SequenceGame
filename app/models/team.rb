class Team < ActiveRecord::Base
	enum color: [:red, :blue, :green]
	serialize :tokens, Array
	serialize :sequences, Array
end
