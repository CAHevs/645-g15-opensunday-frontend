export default async function (url, getAccessTokenSilently) {
  try {
    let token = await getAccessTokenSilently();

    let response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    let data = await response.json();
    console.log(data);
    return data;
  } catch (e) {
    console.error(e);
    return null;

  }
}
