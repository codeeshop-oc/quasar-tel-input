import { findCountryFromISO } from './all-countries'

const getCountry = function () {
    // JSON.parse(localStorage.rev_user.replace('__q_objt|', '')).userId
    let token = ''
    try {     
      token = localStorage.getItem('_r').replace('__q_strn|', '')          
    } catch(err) {      
      // throw new Error('unable to fetch the country');
    }

    return fetch('https://freethefirst.com/api/get-location', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: token})
    })
    .then((response) => response.json())
    .then((response) => {
      if(response.val) {        
        return findCountryFromISO(response.val)
      } else {
        const result = (response.result || '').toString();

        if (!result || result[0] !== '1') {
          throw new Error('unable to fetch the country');
        }

        return result.substr(2, 2);        
      }
    });
};

export default getCountry;
