import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Search, User, MoreVertical } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const MessagesPage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all users for conversations in a single query
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out current user and create conversation list
        const otherUsers = users.filter(user => user.id !== currentUser.id);
        
        // Create conversation list with default values
        const conversationList = otherUsers.map(user => ({
          id: user.id,
          name: user.name,
          photo: user.photo,
          primaryCategory: user.primaryCategory,
          isOnline: user.isOnline || false,
          lastMessage: "Start a conversation!",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        }));

        setConversations(conversationList);

        // If there are conversations, select the first one
        if (conversationList.length > 0) {
          setSelectedConversation(conversationList[0]);
        }

      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  // Listen for all messages to update unread counts
  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.id),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate unread counts for each conversation
      const newUnreadCounts = {};
      
      conversations.forEach(conv => {
        const conversationMessages = allMessages.filter(msg => 
          msg.participants.includes(conv.id) && 
          msg.participants.includes(currentUser.id) &&
          msg.senderId !== currentUser.id && // Only count messages from others
          !msg.readBy?.includes(currentUser.id) // Only count unread messages
        );
        
        newUnreadCounts[conv.id] = conversationMessages.length;
      });

      setUnreadCounts(newUnreadCounts);

      // Update conversation list with unread counts
      setConversations(prev => prev.map(conv => ({
        ...conv,
        unreadCount: newUnreadCounts[conv.id] || 0
      })));

    }, (error) => {
      console.error('Error listening to messages for unread counts:', error);
    });

    return () => unsubscribe();
  }, [currentUser, conversations]);

  useEffect(() => {
    if (!selectedConversation || !currentUser) return;

    console.log('Setting up message listener for:', {
      currentUser: currentUser.id,
      selectedConversation: selectedConversation.id
    });

    // Set up real-time listener for messages between these two users
    const messagesRef = collection(db, 'messages');
    
    try {
      const messagesQuery = query(
        messagesRef,
        where('participants', 'array-contains', currentUser.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        console.log('Snapshot received with', snapshot.docs.length, 'messages');
        
        const allMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('All messages:', allMessages);

        // Filter messages for this specific conversation
        const conversationMessages = allMessages.filter(msg => 
          msg.participants.includes(selectedConversation.id) && 
          msg.participants.includes(currentUser.id)
        );

        console.log('Filtered messages for conversation:', conversationMessages);
        setMessages(conversationMessages);
      }, (error) => {
        console.error('Error listening to messages:', error);
        // Don't show alert, just log the error
        console.log('Message listener error details:', error);
      });

      return () => {
        console.log('Cleaning up message listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up message listener:', error);
      // Don't show alert, just log the error
    }
  }, [selectedConversation, currentUser]);

  const handleTestMessage = async () => {
    if (!selectedConversation || !currentUser) return;

    try {
      const testMessage = {
        senderId: currentUser.id,
        receiverId: selectedConversation.id,
        participants: [currentUser.id, selectedConversation.id].sort(),
        content: `Test message from ${currentUser.name} at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        type: 'text',
        senderName: currentUser.name,
        readBy: [currentUser.id] // Sender has already read their own message
      };

      console.log('Sending test message:', testMessage);
      const docRef = await addDoc(collection(db, 'messages'), testMessage);
      console.log('Test message sent with ID:', docRef.id);
      alert('Test message sent! Check console for details.');
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('Error sending test message: ' + error.message);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark all messages in this conversation as read
    if (conversation.unreadCount > 0) {
      try {
        // Get all unread messages for this conversation
        const messagesRef = collection(db, 'messages');
        const messagesQuery = query(
          messagesRef,
          where('participants', 'array-contains', currentUser.id)
        );
        
        const snapshot = await getDocs(messagesQuery);
        const allMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter messages for this conversation that are unread
        const unreadMessages = allMessages.filter(msg => 
          msg.participants.includes(conversation.id) && 
          msg.participants.includes(currentUser.id) &&
          msg.senderId !== currentUser.id &&
          !msg.readBy?.includes(currentUser.id)
        );

        // Mark each unread message as read
        const updatePromises = unreadMessages.map(async (msg) => {
          const messageRef = doc(db, 'messages', msg.id);
          const readBy = msg.readBy || [];
          if (!readBy.includes(currentUser.id)) {
            await updateDoc(messageRef, {
              readBy: [...readBy, currentUser.id]
            });
          }
        });

        await Promise.all(updatePromises);

        // Update local state immediately for better UX
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedConversation.id,
        participants: [currentUser.id, selectedConversation.id].sort(), // Sort for consistency
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: 'text',
        senderName: currentUser.name,
        readBy: [currentUser.id] // Sender has already read their own message
      };

      console.log('Sending message:', messageData); // Debug log

      // Add message to Firestore
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('Message sent successfully with ID:', docRef.id);

      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toISOString() }
          : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
      setNewMessage(messageContent); // Restore message if failed
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <p className="text-gray-500 mb-4">Please log in to view messages</p>
        <button 
          onClick={() => onNavigate('login')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex fade-in">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💬 Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(600px-80px)]">
          {conversations.length > 0 ? (
            conversations.map(conversation => (
              <div 
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {conversation.photo ? (
                    <img 
                      src={conversation.photo} 
                      alt={conversation.name} 
                      className="profile-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="profile-photo bg-purple-100 flex items-center justify-center">
                      <User className="text-purple-600" />
                    </div>
                  )}
                  <div className="profile-photo bg-purple-100 flex items-center justify-center" style={{ display: 'none' }}>
                    <User className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{conversation.name}</h3>
                      <div className="flex items-center space-x-2">
                        {conversation.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.primaryCategory}</p>
                    <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400">{new Date(conversation.lastMessageTime).toLocaleTimeString()}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 mb-2">No conversations yet!</p>
              <p className="text-gray-400 text-sm">Start chatting with other artists.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                {selectedConversation.photo ? (
                  <img 
                    src={selectedConversation.photo} 
                    alt={selectedConversation.name} 
                    className="profile-photo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="profile-photo bg-purple-100 flex items-center justify-center">
                    <User className="text-purple-600" />
                  </div>
                )}
                <div className="profile-photo bg-purple-100 flex items-center justify-center" style={{ display: 'none' }}>
                  <User className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.primaryCategory} Artist</p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedConversation.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  <span className="text-sm text-gray-500">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </span>
                  <button 
                    onClick={() => onNavigate('artist-profile', selectedConversation.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser.id 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-500 mb-2">No messages yet!</p>
                  <p className="text-gray-400 text-sm">Start the conversation with {selectedConversation.name}.</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3 mb-2">
                <button 
                  onClick={handleTestMessage}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  🧪 Test Message
                </button>
              </div>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 mb-2">Select a conversation to start chatting</p>
              <p className="text-gray-400 text-sm">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 