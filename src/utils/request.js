export default async function (url, getAccessTokenSilently) {
  try {
    let token = await getAccessTokenSilently();

    let response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    //If status code between 200-299
    if(response.ok){
      let data = await response.json();
      return data;
    }
    if(response.status===404){
      return response.status;
    }
    return null;
  } catch (e) {
    //console.error(e);
    return null;

  }
}
