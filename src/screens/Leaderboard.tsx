import React from 'react';
import { StyleSheet, View, ScrollView, Image, ImageSourcePropType, FlatList, PermissionsAndroid} from 'react-native';
import { Button, Text } from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Loaf } from '../data/types';
import { getLoafs, getUserLoafRef, getLoafImageUrl, likeLoaf } from '../data/loafs';
import { url } from 'inspector';
import ImageFilters from 'react-native-gl-image-filters';
import { Surface } from 'gl-react-native';

//interface Props extends NavigationInjectedProps {}

type LeaderboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Leaderboard'
>;

type LeaderboardScreenRouteProp = RouteProp<RootStackParamList, 'Leaderboard'>;

type Props = {
    route: LeaderboardScreenRouteProp;
    navigation: LeaderboardScreenNavigationProp;
};

interface LoafWithIndex {
  creator: string,
  score: number,
  date: Date,
  index: number,
  id: string,
}

interface State {
  //loafs: {loaf: Loaf, imagePath : string}[],
  loafs: LoafWithIndex[],
  imageUris: string[],
  images: ImageSourcePropType[],
  loafCount: number
}

class Leaderboard extends React.Component<Props, State> { 
    constructor(props: Readonly<Props>) {
      super(props);

      this.state = {
        loafs: [],
        imageUris: [],
        loafCount: 15,
        images: [],
      }
  }

  public async componentDidMount () {
    await this.buildLoafs();

    try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: "Read storage permissions",
        message:
          "Cool Photo App needs access to your camera " +
          "so you can take awesome pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the storage");
    } else {
      console.log("Storage permission denied");
    }
  } catch (err) {
    console.warn(err);
  }}
  

    public render() {
        return (
          <View>
            <FlatList
              data={this.state.loafs}
              renderItem={(item) => {
                let uri ='file://' + this.state.imageUris[item.index];
                return <View style={{borderRadius: 4, borderWidth: 2, borderColor: 'black', margin: 12, alignSelf: 'center'}}>
                    <Text style={{textAlign:'center'}}>{'Creator: ' + item.item.creator}</Text>
                    <Text style={{textAlign:'center'}}>{'Date: ' + item.item.date}</Text>
                    <Text style={{textAlign:'center'}}>{'Score: '+item.item.score}</Text>
                    <Surface style={{width:300, height:300, alignSelf: 'center'}}>
                      <ImageFilters width={300} height={300}>{{ uri: uri}}</ImageFilters>
                    </Surface>
                    <Button buttonStyle={{margin:8}} onPress={() => likeLoaf(item.item.id)} title="Like"></Button>
               </View>
              }}
              keyExtractor={(item, index) => index.toString()}
            ></FlatList>
          </View>
        )
    }    



    private buildLoafs = async () => {
      let loafsArray = [];
      let iamgesArray = [];
      let images = [];
      let loafs = await (await getLoafs()).orderBy('loaf.score', 'desc').limit(this.state.loafCount).get();
      for (let i: number=0; i< loafs.docs.length; i++){
        let loafId = loafs.docs[i].id;
        console.log('loafs ID ' + loafId)
        let loafData = loafs.docs[i].data();
        let uri = await getLoafImageUrl(loafId);
        console.log("creator: " + loafData.loaf.creator + ' index:' + i);
        loafsArray.push({creator: loafData.loaf.creator, date: loafData.loaf.date, score: loafData.loaf.score, index: i, id: loafId});
        //let nodeRequire = require(uri);
        //images.push(nodeRequire);
        iamgesArray.push(uri)
        console.log("index: " + i + " imageUri: " + uri);
      };
       this.setState({
        loafs: loafsArray,
        imageUris: iamgesArray,
        images: images,
      })
      console.log("loafsArray size: " + iamgesArray.length)
    }
}

export default Leaderboard;

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  img: {
    alignSelf:'center', 
    marginVertical:12, 
    width:200,
    //flex:1,
  },
  buttonTitleStyle: {
    fontFamily:'aAlloyInk', 
  }
});