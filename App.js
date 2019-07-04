import React, {Component} from 'react'
import {StatusBar, StyleSheet, ScrollView, View, AsyncStorage, ActivityIndicator} from 'react-native'
import {primaryGradientArray} from "./app/utils/Colors"
import {LinearGradient} from "expo-linear-gradient"

import Header from "./app/components/Header"
import Input from "./app/components/Input"
import List from "./app/components/List"
import Button from "./app/components/Button";
import SubTitle from "./app/components/Subtitle";
import uuid from "uuid-js";

class App extends Component {

    state = {
        inputValue: '',
        loadingItems: false,
        allItems: {},
        isCompleted: false
    }

    componentDidMount = () => {
        this.loadingItems()
    }

    newInputValue = value => {
        this.setState({
            inputValue: value
        })
    }

    loadingItems = async () => {
        try {
            const allItems = await AsyncStorage.getItem('ToDos');
            this.setState({
                loadingItems: true,
                allItems: JSON.parse(allItems) || {}
            });
        } catch (err) {
            console.log(err);
        }
    }

    onDoneAddItem = () => {
        const {inputValue} = this.state;
        if (inputValue !== '') {
            this.setState(prevState => {
                const id = uuid();
                const newItemObject = {
                    [id]: {
                        id,
                        isCompleted: false,
                        text: inputValue,
                        createdAt: Date.now()
                    }
                };
                const newState = {
                    ...prevState,
                    inputValue: '',
                    allItems: {
                        ...prevState.allItems,
                        ...newItemObject
                    }
                };
                this.saveItems(newState.allItems);
                return {...newState};
            });
        }
    }

    deleteItem = id => {
        this.setState(prevState => {
            const allItems = prevState.allItems;
            delete allItems[id];
            const newState = {
                ...prevState,
                ...allItems
            };
            this.saveItems(newState.allItems);
            return { ...newState };
        });
    };

    completeItem = id => {
        this.setState(prevState => {
            const newState = {
                ...prevState,
                allItems: {
                    ...prevState.allItems,
                    [id]: {
                        ...prevState.allItems[id],
                        isCompleted: true
                    }
                }
            };
            this.saveItems(newState.allItems);
            return {...newState};
        });
    }

    incompleteItem = id => {
        this.setState(prevState => {
            const newState = {
                ...prevState,
                allItems: {
                    ...prevState.allItems,
                    [id]: {
                        ...prevState.allItems[id],
                        isCompleted: false
                    }
                }
            };
            this.saveItems(newState.allItems);
            return {...newState};
        });
    }

    deleteAllItems = async () => {
        try {
            await AsyncStorage.removeItem('ToDos');
            this.setState({allItems: {}});
        } catch (err) {
            console.log(err);
        }
    }

    saveItems = newItem => {
        const saveItem = AsyncStorage.setItem('To Dos', JSON.stringify(newItem));
    };

    render() {
        const { inputValue, loadingItems, allItems } = this.state;
        const headerTitle = 'TodoApp'
        return (
            <LinearGradient colors={primaryGradientArray}
                            start={[0, 1]}
                            end={[1, 0]}
                            locations={[1, 0]}
                            style={styles.container}
            >
                <StatusBar barStyle="light-content" />
                <View style={styles.centered}>
                    <Header title={headerTitle} />
                </View>
                <View style={styles.inputContainer}>
                    <SubTitle subtitle={"What's Next?"} />
                    <Input
                        inputValue={inputValue}
                        onChangeText={this.newInputValue}
                        onDoneAddItem={this.onDoneAddItem}
                    />
                </View>
                <View style={styles.list}>
                    <View style={styles.column}>
                        <SubTitle subtitle={'Recent Notes'} />
                        <View style={styles.deleteAllButton}>
                            <Button deleteAllItems={this.deleteAllItems} />
                        </View>
                    </View>
                    {loadingItems ? (
                        <ScrollView contentContainerStyle={styles.scrollableList}>
                            {Object.values(allItems)
                                .reverse()
                                .map(item => (
                                    <List
                                        key={item.id}
                                        {...item}
                                        deleteItem={this.deleteItem}
                                        completeItem={this.completeItem}
                                        incompleteItem={this.incompleteItem}
                                    />
                                ))}
                        </ScrollView>
                    ) : (
                        <ActivityIndicator size="large" color="white" />
                    )}
                </View>
            </LinearGradient>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    centered: {
        alignItems: 'center'
    },
    inputContainer: {
        marginTop: 40,
        paddingLeft: 15
    },
    list: {
        flex: 1,
        marginTop: 70,
        paddingLeft: 15,
        marginBottom: 10
    },
    scrollableList: {
        marginTop: 15
    },
    column: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    deleteAllButton: {
        marginRight: 40
    }
})


export default App