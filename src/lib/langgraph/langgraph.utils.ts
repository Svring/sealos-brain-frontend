export async function checkGraphStatus(apiUrl: string): Promise<boolean> {
	try {
		const res = await fetch(`${apiUrl}/info`);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}
