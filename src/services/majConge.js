import axios from "axios";
import urls from './urls';
import { useState, useEffect } from "react";

const MajConge = () => {

  const [Datas, setDatas] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const differenceEnJours = (date1, date2) => {
    const dateObj1 = new Date(date1);
    const dateObj2 = new Date(date2);
    return Math.round((dateObj2 - dateObj1) / (24 * 60 * 60 * 1000));
  }

  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

  useEffect(() => {

    axios
      .get(`${urls.StrapiUrl}api/personnels?pagination[pageSize]=100`)
      .then((response) => {
        setDatas(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);

  useEffect(() => {
    Datas.map((Personnel) => {
      
      let differenceJours = differenceEnJours(Personnel.attributes.dateDernierConge, formattedDate);

      let nombreAjours = Math.floor(differenceJours / 30);
      let ajoutTotal = nombreAjours * 2.5;

      ajoutTotal < 0 ? ajoutTotal = 0 : ajoutTotal; 

      if(ajoutTotal > 0){

        try {
       
          axios.put(`${urls.StrapiUrl}api/personnels/${Personnel.id}`, {
            data: {
              conge: (ajoutTotal + Personnel.attributes.conge),
            },
      
          }).then((response) => {
            console.log('Succès des maj des congés!');
          })
      
        } catch (error) {
          console.error('Erreur lors de la maj des congés à Strapi:', error);
        }

      }
      return null;
    });
  }, [Datas]);

};

export default MajConge;
