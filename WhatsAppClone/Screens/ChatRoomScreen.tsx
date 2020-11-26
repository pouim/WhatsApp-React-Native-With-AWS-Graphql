import React, { useEffect, useState } from 'react';
import {useRoute} from '@react-navigation/native';
import {View, FlatList, ImageBackground} from 'react-native';
import ChatMessage from '../Components/ChatMessage';
import InputArea from '../Components/ChatMessage/InputArea';

import {API, graphqlOperation, Auth } from 'aws-amplify';
import { messagesByChatRoom } from '../graphql/queries';
import { onCreateMessage } from '../graphql/subscriptions';
import chatRoomData from '../data/Chats';
import Bg from '../assets/images/BG.png';

const ChatRoomScreen = () => {
  const route = useRoute();
  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const messagesData = await API.graphql(
      graphqlOperation(messagesByChatRoom, {
        chatRoomID: route.params.id,
        sortDirection: 'DESC',
      }),
    );

    console.log('FETCH MESSAGES');
    setMessages(messagesData.data.messagesByChatRoom.items);
  };

  useEffect(() => {
    fetchMessages();
  }, []);


  useEffect(() => {
    const getMyId = async () => {
      const userInfo = await Auth.currentAuthenticatedUser();
      setMyId(userInfo.attributes.sub);
    }
    getMyId();
  }, [])

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateMessage),
    ).subscribe({
      next: (data) => {
        const newMessage = data.value.data.onCreateMessage;

        if (newMessage.chatRoomID !== route.params.id) {
          console.log('Message is in another room!');
          return;
        }
         setMessages([newMessage, ...messages]);
        fetchMessages();
       
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ImageBackground style={{width: '100%', height: '100%'}} source={Bg}>
      <FlatList
        data={messages}
        renderItem={({item}) => <ChatMessage myId={myId} message={item} />}
        inverted
      />
      <InputArea chatRoomID={route.params.id} />
    </ImageBackground>
  );
};

export default ChatRoomScreen;
