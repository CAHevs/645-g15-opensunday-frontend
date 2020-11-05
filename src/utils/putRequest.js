export default async function (url, getAccessTokenSilently, objectToUpdate) {
    try {
        let token = await getAccessTokenSilently();

        let response = await fetch(url, {
            method: 'PUT',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: objectToUpdate
        });
        console.log(response);
        return response.status;
    } catch (e) {
        console.error(e);
        return null;

    }
}