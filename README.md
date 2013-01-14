TartanHacks Registration Client Interface
===============

This is the client interface for the TartanHacks 2013 registration system. 
To learn more about TartanHacks, check out [http://tartanhacks.com](http://tartanhacks.com/ "TartanHacks").
For a live demo of this interface, look at [http://register.tartanhacks.com](http://register.tartanhacks.com/ "TartanHacks Registration").

## Development Notes
While developing locally, set `DEV_MODE=true;` in order to use static local JSON instead of calling the external API (which most browsers disallow due to cross-origin requests).

## API

The current registration status can be found by making a GET request to
```
http://register.tartanhacks.com/api/active_registration_types
```

To submit a user to the server, make a POST request to
```
http://register.tartanhacks.com/api/submit_registration
```
The following attributes are required:
- `type` Registration category string ('PRE' || GEN || EXT || GRAD)
- `firstName` nonempty string
- `lastName` nonempty string
- `email` nonempty string
- `gradYear` integer
- `tshirtSize` string ('MS' || 'MM' || 'ML' || 'MXL' || 'FS' || 'FM' || 'FL' || 'FXL')
- `dietaryRestriction` string
- `university` string ('CMU' || 'PITT' || 'PENN' || 'PRINCETON' || 'MIT' || 'CORNELL' || other)
- `cmuCollege` (string 'CIT' || 'CFA' || 'DCHS' || 'TPR' || 'HNZ' || 'MCS' || 'SCS' || 'NA')


## Contributors
- [Ryhan Hassan](https://github.com/ryhan 'Ryhan Hassan')
- [Kevin Schaefer](https://github.com/schaef2493 'Kevin Schaefer')