import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Events from "../components/Events";
import EventReport from "../components/EventReport";
import Payments from "../components/Payments";
import Attendance from "../components/Attendance";

const Tab = createBottomTabNavigator();

export default Combined = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Events') {
                        iconName = focused ? 'map-marker' : 'map-marker';
                    } else if (route.name === 'EventReport') {
                        iconName = focused ? 'tasks' : 'tasks';
                    } else if (route.name === 'Payments') {
                        iconName = focused ? 'credit-card-alt' : 'credit-card';
                    } else if (route.name === 'Attendance') {
                        iconName = focused ? 'list' : 'list-alt';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'pink',
                tabBarInactiveTintColor: 'gray',
            })
            }
        >
            <Tab.Screen name="Events" component={Events} />
            <Tab.Screen name="EventReport" component={EventReport} />
            <Tab.Screen name="Payments" component={Payments} />
            <Tab.Screen name="Attendance" component={Attendance} />
        </Tab.Navigator>
    );
}