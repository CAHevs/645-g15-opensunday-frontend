export default async function (url, getAccessTokenSilently, objectToPost) {
    try {
        let token = await getAccessTokenSilently();

        let response = await fetch(url, {
            method: 'POST',
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                'Content-Type': "application/json",

            },
            body: objectToPost
        });
        console.log(response);
        if(response.ok){
            let data = await response.json();
            console.log(data);
            return data;
        }
        if(response.status === 409){
            return response.status;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;

    }
}