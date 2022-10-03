import React, { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Auth } from 'aws-amplify';

import { createTopic } from './graphql/mutations';
import { listTopics } from './graphql/queries';
const initialState = { content: '' };
const App = () => {

  const [formState, setFormState] = useState(initialState);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    fetchTopics()
  }, []);

  const setInput = (key, value) => setFormState({ ...formState, [key]: value });

  const fetchTopics = async () => {
    try {
      const topicData = await API.graphql(graphqlOperation(listTopics));
      const topics = topicData.data.listTopics.items;
      setTopics(topics);
    } catch (err) { console.error('error fetching topics')}
  }

  const addTopic = async () => {
    try {
      if (formState.content) {
        const topic = { ...formState }
        setTopics([...topics, topic]);
        setFormState(initialState);
        await API.graphql(graphqlOperation(createTopic, {input: topic}))
      }
    } catch (err) { console.error('error creating topic:', err)}
  }

  const randomTopicIndex = () => Math.floor(Math.random() * topics.length);

  const selectRandomTopic = () => {
    const topic = topics.splice(randomTopicIndex(), 1)[0];
    setSelectedTopics([...selectedTopics, topic]);
    setTopics(topics);
  }

  return (
    <div style={styles.container}>
      <h2>Sermon Surprise!</h2>
      <input
        onChange={event => setInput('content', event.target.value)}
        style={styles.input}
        value={formState.content}
        placeholder="Topic"
      />
      <button style={styles.button} onClick={addTopic}>CREATE TOPIC</button>
      <button style={styles.button} disabled={topics.length <= 0} onClick={selectRandomTopic}>Select Topic</button>
      {
        selectedTopics.map((topic, index) => (
          <div key={topic.id ? topic.id : index} style={styles.topic}>
            <p style={styles.topicContent}>{topic.content}</p>
          </div>
        ))
      }
    </div>
  );
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  topic: {  marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#c4c4c4', borderRadius: 8, backgroundColor: 'white', marginBottom: 10, padding: 8, fontSize: 18 },
  topicContent: { fontSize: 20, fontWeight: 'bold' },
  button: { fontFamily: 'Roboto', fontWeight: 'Medium', borderRadius: 12, borderWidth: 0, backgroundColor: '#8bd1ce', color: 'white', outline: 'none', fontSize: 16, marginTop: 10, padding: '12px 0px' }
}

export default withAuthenticator(App);
