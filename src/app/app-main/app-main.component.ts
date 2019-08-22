import { Component, OnInit } from '@angular/core';
import { UserBubble } from './someclass'

@Component({
  selector: 'app-app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.css']
})
export class AppMainComponent implements OnInit {
    users: UserBubble[] = [
        {
            id: "43d4a11c-c07d-47bd-b275-d3d543e877f4",
            name: "Jordan",
            imageUrl: "https://orig00.deviantart.net/cf0b/f/2010/247/0/7/school_uniform_and_new_id_by_darkletrick-d2y0l2k.png",
            timeLeft: 20
        },
        {
            id: "8b43f585-5bad-42bc-bdc3-f39f9876b9f7",
            name: "Lukas",
            imageUrl: "https://www.thefamouspeople.com/profiles/images/lukas-podolski-1.jpg",
            timeLeft: 20
        },
        {
            id: "91209d41-f439-4622-8ef6-65c09c04de68",
            name: "Anna",
            imageUrl: "https://www.newdvdreleasedates.com/images/profiles/anna-paquin-01.jpg",
            timeLeft: 20
        }
    ];

    constructor() { }

    ngOnInit() {
        setTimeout(function(users){
            rotateUsers(users);
        }, 1000);
    }

}

function rotateUsers(userArr: UserBubble[])
{
    userArr.push(userArr.shift());
}
