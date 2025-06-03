<script lang="ts">
	let { class: className = '', userName } = $props<{
		class?: string
		userName: string
	}>()

	const currentHour = new Date().getHours()

	const morningGreetings = [
		`Good morning, ${userName}! ☀️`,
		`Hey ${userName}, ready to tackle the day?`,
		`Morning! Time for some fuel ☕`,
		`Rise and shine ${userName}`,
		`Another day, another byte! Morning ${userName}`,
		`Early bird today, ${userName}? 🐦`,
		`Coffee first, then we code. Morning!`,
		`Ready to debug your hunger, ${userName}?`,
		`Fresh morning, fresh possibilities!`,
	]

	const afternoonGreetings = [
		`Afternoon ${userName}! Lunch calling? 🍽️`,
		`Hey there! Ready for a midday refuel?`,
		`Time to commit to lunch, ${userName}`,
		`Afternoon! Your stomach's probably sending notifications`,
		`Lunch break protocol initiated 🚀`,
		`Perfect timing ${userName}, let's eat!`,
		`Merge request: hunger with food`,
		`Stack getting empty? Time to fill it up!`,
		`Afternoon ${userName}, deploy some nutrition`,
	]

	const eveningGreetings = [
		`Evening ${userName}! 🌆 Dinner time?`,
		`Hey! Time to close today's hunger loop`,
		`End of day feast awaits, ${userName}`,
		`Evening! Ready to git some dinner?`,
		`Perfect timing ${userName}, let's wrap up with food`,
		`Shutdown work mode, activate dinner mode 💾`,
		`Final deployment of the day: food!`,
		`Evening ${userName}, time to refactor your energy`,
		`Day's almost done, but dinner's just beginning! 🍴`,
	]

	const lateNightGreetings = [
		`Still up ${userName}? 🌙 Late night snack?`,
		`Night owl! Time for some midnight fuel`,
		`Burning the midnight oil, ${userName}?`,
		`Late night coding session? Feed the machine!`,
		`Hey ${userName}, even devs need midnight munchies`,
		`Working late? Your brain needs glucose 🧠`,
		`Night shift ${userName}? Let's grab some energy`,
		`Stars are out, hunger's calling! 🌟`,
		`Late night ${userName}, but never too late to eat`,
	]

	let greetings: string[]
	if (currentHour < 12 && currentHour >= 5) {
		greetings = morningGreetings
	} else if (currentHour < 17) {
		greetings = afternoonGreetings
	} else if (currentHour < 21) {
		greetings = eveningGreetings
	} else {
		greetings = lateNightGreetings
	}

	const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
</script>

<div class={className}>
	{randomGreeting}
</div>
