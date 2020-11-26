import React, { useEffect, useState } from 'react';
import {FlatList, StyleSheet, View, Text} from 'react-native';
import ContactListItem from '../Components/ContactListItem';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { listUsers } from '../graphql/queries';

export default function ContactsScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
   const fetchUsers = async () => {
     try {
       const usersData = await API.graphql(
         graphqlOperation(
            listUsers
       ));
      const userInfo = await Auth.currentAuthenticatedUser();
      const usersDataWithoutMyUserId = usersData.data.listUsers.items.filter(item => item.id !== userInfo.attributes.sub);
      setUsers(usersDataWithoutMyUserId);
     } catch (e) {
       console.log(e);
     }
   };

   fetchUsers();
  }, []);

 
  return (
    <View style={styles.container}>
      <FlatList
        style={{width: '100%'}}
        data={users}
        renderItem={({item}) => <ContactListItem user={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
