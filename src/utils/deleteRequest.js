export default async function (url, getAccessTokenSilently) {
    try {
        let token = await getAccessTokenSilently();

        let response = await fetch(url, {
            method: 'DELETE',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",

            },
        });
        return response.status;
    } catch (e) {
        console.error(e);
        return null;

    }
}