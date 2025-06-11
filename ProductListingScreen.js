import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'


const ProductListingScreen = () => {
    const[products,setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        getProducts();
    },[]);

    const getProducts = () => {
        const url = "https://fakestoreapi.com/products" 

        fetch(url).
        then(res=>{
            if(!res.ok){
                throw new Error("something went wrong. error code: 404#")

            }
            return res.json(); // cpnvert to readable format

        })
        .then(data=>{
            setProducts(data);
            setIsLoading(false);
            console.log(data);
        }).catch((error)=>{
            setError(error.message);
            setIsLoading(false);
            console.log(error.message);
        })
        
    };
  
  return (
    
    <View>
        {isLoading ? (
            <ActivityIndicator color="red" size="small" />
        ) : error ? <Text style={styles.errorStyle}>{error}</Text> : (

      //<Text>Product Listing Screen</Text>
      <FlatList 
      data = {products} 
      renderItem = {({ item }) => (
        <View style={styles.cardContainer}>
            <Image source={{uri: item.image}} style={styles.image} />
            <Text style={{fontSize: 18, textAlign: "center"}}>
                {item.price}
            </Text>
      </View>
    )} 
    />)}
    </View>
  );
};

export default ProductListingScreen

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "rgb(0, 0, 0)", 
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 6,
        marginTop: 40,
        marginBottom: 20,
    },
    image: {
        height: 200,
        width: 200,
    },
    errorStyle: {
        fontWeight: "bold",
        padding: 10,
        alignContent: "center",
        textAlign: "center",
        color: "red",
        fontSize: 18,
    },
})