/**
 * MultiTools Hub - US Area Code & ZIP Code Lookup / Validator
 * 100% Client-Side Embedded Offline Database
 */

document.addEventListener('DOMContentLoaded', () => {
  // Embedded dataset: Major US Area Codes mapped to State, Metro, and Time Zone
  const AREA_CODES = [
    { code: "201", state: "NJ", name: "New Jersey", city: "Jersey City, Hackensack", tz: "Eastern" },
    { code: "202", state: "DC", name: "District of Columbia", city: "Washington D.C.", tz: "Eastern" },
    { code: "203", state: "CT", name: "Connecticut", city: "Bridgeport, New Haven, Stamford", tz: "Eastern" },
    { code: "205", state: "AL", name: "Alabama", city: "Birmingham, Tuscaloosa", tz: "Central" },
    { code: "206", state: "WA", name: "Washington", city: "Seattle, Bainbridge Island", tz: "Pacific" },
    { code: "207", state: "ME", name: "Maine", city: "Portland, Bangor, Entire State", tz: "Eastern" },
    { code: "208", state: "ID", name: "Idaho", city: "Boise, Idaho Falls, Pocatello", tz: "Mountain / Pacific" },
    { code: "209", state: "CA", name: "California", city: "Stockton, Modesto, Merced", tz: "Pacific" },
    { code: "210", state: "TX", name: "Texas", city: "San Antonio", tz: "Central" },
    { code: "212", state: "NY", name: "New York", city: "New York City (Manhattan)", tz: "Eastern" },
    { code: "213", state: "CA", name: "California", city: "Los Angeles (Downtown)", tz: "Pacific" },
    { code: "214", state: "TX", name: "Texas", city: "Dallas, Irving, Plano", tz: "Central" },
    { code: "215", state: "PA", name: "Pennsylvania", city: "Philadelphia", tz: "Eastern" },
    { code: "216", state: "OH", name: "Ohio", city: "Cleveland, Lakewood", tz: "Eastern" },
    { code: "217", state: "IL", name: "Illinois", city: "Springfield, Champaign, Urbana", tz: "Central" },
    { code: "218", state: "MN", name: "Minnesota", city: "Duluth, Moorhead, Brainerd", tz: "Central" },
    { code: "219", state: "IN", name: "Indiana", city: "Gary, Hammond, Michigan City", tz: "Central" },
    { code: "224", state: "IL", name: "Illinois", city: "Waukegan, Elgin, Arlington Heights", tz: "Central" },
    { code: "225", state: "LA", name: "Louisiana", city: "Baton Rouge", tz: "Central" },
    { code: "228", state: "MS", name: "Mississippi", city: "Gulfport, Biloxi, Pascagoula", tz: "Central" },
    { code: "229", state: "GA", name: "Georgia", city: "Albany, Valdosta, Thomasville", tz: "Eastern" },
    { code: "231", state: "MI", name: "Michigan", city: "Muskegon, Traverse City", tz: "Eastern" },
    { code: "234", state: "OH", name: "Ohio", city: "Akron, Canton, Youngstown", tz: "Eastern" },
    { code: "239", state: "FL", name: "Florida", city: "Cape Coral, Fort Myers, Naples", tz: "Eastern" },
    { code: "240", state: "MD", name: "Maryland", city: "Bethesda, Silver Spring, Frederick", tz: "Eastern" },
    { code: "248", state: "MI", name: "Michigan", city: "Troy, Southfield, Pontiac, Oakland Co.", tz: "Eastern" },
    { code: "251", state: "AL", name: "Alabama", city: "Mobile, Prichard, Daphne", tz: "Central" },
    { code: "252", state: "NC", name: "North Carolina", city: "Greenville, Rocky Mount, Outer Banks", tz: "Eastern" },
    { code: "253", state: "WA", name: "Washington", city: "Tacoma, Federal Way, Auburn", tz: "Pacific" },
    { code: "254", state: "TX", name: "Texas", city: "Waco, Killeen, Temple", tz: "Central" },
    { code: "256", state: "AL", name: "Alabama", city: "Huntsville, Decatur, Madison", tz: "Central" },
    { code: "260", state: "IN", name: "Indiana", city: "Fort Wayne, Huntington", tz: "Eastern" },
    { code: "262", state: "WI", name: "Wisconsin", city: "Kenosha, Racine, Waukesha", tz: "Central" },
    { code: "267", state: "PA", name: "Pennsylvania", city: "Philadelphia", tz: "Eastern" },
    { code: "269", state: "MI", name: "Michigan", city: "Kalamazoo, Battle Creek", tz: "Eastern" },
    { code: "270", state: "KY", name: "Kentucky", city: "Bowling Green, Owensboro, Paducah", tz: "Central" },
    { code: "272", state: "PA", name: "Pennsylvania", city: "Scranton, Wilkes-Barre, Williamsport", tz: "Eastern" },
    { code: "276", state: "VA", name: "Virginia", city: "Bristol, Martinsville", tz: "Eastern" },
    { code: "281", state: "TX", name: "Texas", city: "Houston, Sugar Land, Pasadena", tz: "Central" },
    { code: "301", state: "MD", name: "Maryland", city: "Silver Spring, Rockville, Gaithersburg", tz: "Eastern" },
    { code: "302", state: "DE", name: "Delaware", city: "Wilmington, Dover, Entire State", tz: "Eastern" },
    { code: "303", state: "CO", name: "Colorado", city: "Denver, Boulder, Aurora, Lakewood", tz: "Mountain" },
    { code: "304", state: "WV", name: "West Virginia", city: "Charleston, Huntington, Morgantown", tz: "Eastern" },
    { code: "305", state: "FL", name: "Florida", city: "Miami, Key West, Miami Beach", tz: "Eastern" },
    { code: "307", state: "WY", name: "Wyoming", city: "Cheyenne, Casper, Laramie, Entire State", tz: "Mountain" },
    { code: "308", state: "NE", name: "Nebraska", city: "Grand Island, Kearney, Scottsbluff", tz: "Central / Mountain" },
    { code: "309", state: "IL", name: "Illinois", city: "Peoria, Bloomington, Normal, Moline", tz: "Central" },
    { code: "310", state: "CA", name: "California", city: "Santa Monica, Beverly Hills, Torrance", tz: "Pacific" },
    { code: "312", state: "IL", name: "Illinois", city: "Chicago (The Loop, Downtown)", tz: "Central" },
    { code: "313", state: "MI", name: "Michigan", city: "Detroit, Dearborn", tz: "Eastern" },
    { code: "314", state: "MO", name: "Missouri", city: "St. Louis, Florissant", tz: "Central" },
    { code: "315", state: "NY", name: "New York", city: "Syracuse, Utica, Watertown", tz: "Eastern" },
    { code: "316", state: "KS", name: "Kansas", city: "Wichita, Derby, Andover", tz: "Central" },
    { code: "317", state: "IN", name: "Indiana", city: "Indianapolis, Carmel, Fishers", tz: "Eastern" },
    { code: "318", state: "LA", name: "Louisiana", city: "Shreveport, Monroe, Alexandria", tz: "Central" },
    { code: "319", state: "IA", name: "Iowa", city: "Cedar Rapids, Iowa City, Waterloo", tz: "Central" },
    { code: "320", state: "MN", name: "Minnesota", city: "St. Cloud, Willmar, Alexandria", tz: "Central" },
    { code: "321", state: "FL", name: "Florida", city: "Orlando, Melbourne, Cape Canaveral", tz: "Eastern" },
    { code: "323", state: "CA", name: "California", city: "Los Angeles (Hollywood, East LA)", tz: "Pacific" },
    { code: "325", state: "TX", name: "Texas", city: "Abilene, San Angelo", tz: "Central" },
    { code: "330", state: "OH", name: "Ohio", city: "Akron, Youngstown, Canton", tz: "Eastern" },
    { code: "331", state: "IL", name: "Illinois", city: "Aurora, Naperville, Wheaton", tz: "Central" },
    { code: "332", state: "NY", name: "New York", city: "New York City (Manhattan overlay)", tz: "Eastern" },
    { code: "334", state: "AL", name: "Alabama", city: "Montgomery, Auburn, Dothan", tz: "Central" },
    { code: "336", state: "NC", name: "North Carolina", city: "Greensboro, Winston-Salem, High Point", tz: "Eastern" },
    { code: "337", state: "LA", name: "Louisiana", city: "Lafayette, Lake Charles", tz: "Central" },
    { code: "339", state: "MA", name: "Massachusetts", city: "Lynn, Waltham, Weymouth", tz: "Eastern" },
    { code: "346", state: "TX", name: "Texas", city: "Houston (Overlay)", tz: "Central" },
    { code: "347", state: "NY", name: "New York", city: "New York City (Brooklyn, Queens, Bronx, SI)", tz: "Eastern" },
    { code: "351", state: "MA", name: "Massachusetts", city: "Lowell, Lawrence, Haverhill", tz: "Eastern" },
    { code: "352", state: "FL", name: "Florida", city: "Gainesville, Ocala, Spring Hill", tz: "Eastern" },
    { code: "360", state: "WA", name: "Washington", city: "Olympia, Vancouver, Bellingham", tz: "Pacific" },
    { code: "361", state: "TX", name: "Texas", city: "Corpus Christi, Victoria", tz: "Central" },
    { code: "386", state: "FL", name: "Florida", city: "Daytona Beach, Deltona, Palm Coast", tz: "Eastern" },
    { code: "401", state: "RI", name: "Rhode Island", city: "Providence, Warwick, Cranston, Entire State", tz: "Eastern" },
    { code: "402", state: "NE", name: "Nebraska", city: "Omaha, Lincoln, Bellevue", tz: "Central" },
    { code: "404", state: "GA", name: "Georgia", city: "Atlanta, Sandy Springs, East Point", tz: "Eastern" },
    { code: "405", state: "OK", name: "Oklahoma", city: "Oklahoma City, Norman, Edmond", tz: "Central" },
    { code: "406", state: "MT", name: "Montana", city: "Billings, Missoula, Great Falls, Entire State", tz: "Mountain" },
    { code: "407", state: "FL", name: "Florida", city: "Orlando, Kissimmee, Sanford", tz: "Eastern" },
    { code: "408", state: "CA", name: "California", city: "San Jose, Sunnyvale, Santa Clara (Silicon Valley)", tz: "Pacific" },
    { code: "409", state: "TX", name: "Texas", city: "Beaumont, Galveston, Port Arthur", tz: "Central" },
    { code: "410", state: "MD", name: "Maryland", city: "Baltimore, Annapolis, Columbia", tz: "Eastern" },
    { code: "412", state: "PA", name: "Pennsylvania", city: "Pittsburgh, Bethel Park, Penn Hills", tz: "Eastern" },
    { code: "413", state: "MA", name: "Massachusetts", city: "Springfield, Chicopee, Pittsfield", tz: "Eastern" },
    { code: "414", state: "WI", name: "Wisconsin", city: "Milwaukee, West Allis, Wauwatosa", tz: "Central" },
    { code: "415", state: "CA", name: "California", city: "San Francisco, San Rafael, Marin County", tz: "Pacific" },
    { code: "417", state: "MO", name: "Missouri", city: "Springfield, Joplin, Branson", tz: "Central" },
    { code: "419", state: "OH", name: "Ohio", city: "Toledo, Mansfield, Lima, Sandusky", tz: "Eastern" },
    { code: "423", state: "TN", name: "Tennessee", city: "Chattanooga, Johnson City, Kingsport", tz: "Eastern / Central" },
    { code: "424", state: "CA", name: "California", city: "Santa Monica, Torrance, Beverly Hills", tz: "Pacific" },
    { code: "425", state: "WA", name: "Washington", city: "Bellevue, Redmond, Everett, Kirkland", tz: "Pacific" },
    { code: "430", state: "TX", name: "Texas", city: "Tyler, Longview, Texarkana", tz: "Central" },
    { code: "432", state: "TX", name: "Texas", city: "Midland, Odessa, Big Spring", tz: "Central" },
    { code: "434", state: "VA", name: "Virginia", city: "Lynchburg, Charlottesville, Danville", tz: "Eastern" },
    { code: "435", state: "UT", name: "Utah", city: "St. George, Logan, Park City, Moab", tz: "Mountain" },
    { code: "440", state: "OH", name: "Ohio", city: "Parma, Lorain, Elyria, Mentor", tz: "Eastern" },
    { code: "442", state: "CA", name: "California", city: "Oceanside, Palm Springs, Escondido", tz: "Pacific" },
    { code: "443", state: "MD", name: "Maryland", city: "Baltimore, Annapolis, Salisbury", tz: "Eastern" },
    { code: "469", state: "TX", name: "Texas", city: "Dallas, Plano, Irving, Garland", tz: "Central" },
    { code: "470", state: "GA", name: "Georgia", city: "Atlanta, Marietta, Roswell, Alpharetta", tz: "Eastern" },
    { code: "475", state: "CT", name: "Connecticut", city: "New Haven, Bridgeport, Stamford", tz: "Eastern" },
    { code: "479", state: "AR", name: "Arkansas", city: "Fort Smith, Fayetteville, Springdale, Rogers", tz: "Central" },
    { code: "480", state: "AZ", name: "Arizona", city: "Mesa, Scottsdale, Tempe, Chandler", tz: "Mountain (No DST)" },
    { code: "484", state: "PA", name: "Pennsylvania", city: "Allentown, Bethlehem, Reading", tz: "Eastern" },
    { code: "501", state: "AR", name: "Arkansas", city: "Little Rock, North Little Rock, Conway", tz: "Central" },
    { code: "502", state: "KY", name: "Kentucky", city: "Louisville, Frankfort, Jeffersontown", tz: "Eastern" },
    { code: "503", state: "OR", name: "Oregon", city: "Portland, Salem, Gresham, Hillsboro", tz: "Pacific" },
    { code: "504", state: "LA", name: "Louisiana", city: "New Orleans, Metairie, Kenner", tz: "Central" },
    { code: "505", state: "NM", name: "New Mexico", city: "Albuquerque, Santa Fe, Farmington", tz: "Mountain" },
    { code: "507", state: "MN", name: "Minnesota", city: "Rochester, Mankato, Winona", tz: "Central" },
    { code: "508", state: "MA", name: "Massachusetts", city: "Worcester, New Bedford, Brockton, Cape Cod", tz: "Eastern" },
    { code: "509", state: "WA", name: "Washington", city: "Spokane, Tacoma, Yakima, Tri-Cities", tz: "Pacific" },
    { code: "510", state: "CA", name: "California", city: "Oakland, Berkeley, Fremont, Hayward", tz: "Pacific" },
    { code: "512", state: "TX", name: "Texas", city: "Austin, San Marcos, Round Rock", tz: "Central" },
    { code: "513", state: "OH", name: "Ohio", city: "Cincinnati, Hamilton, Middletown", tz: "Eastern" },
    { code: "515", state: "IA", name: "Iowa", city: "Des Moines, Ames, West Des Moines", tz: "Central" },
    { code: "516", state: "NY", name: "New York", city: "Long Island (Nassau County)", tz: "Eastern" },
    { code: "517", state: "MI", name: "Michigan", city: "Lansing, East Lansing, Jackson", tz: "Eastern" },
    { code: "518", state: "NY", name: "New York", city: "Albany, Schenectady, Troy, Saratoga Springs", tz: "Eastern" },
    { code: "520", state: "AZ", name: "Arizona", city: "Tucson, Casa Grande, Sierra Vista", tz: "Mountain (No DST)" },
    { code: "530", state: "CA", name: "California", city: "Redding, Chico, Davis, Lake Tahoe", tz: "Pacific" },
    { code: "540", state: "VA", name: "Virginia", city: "Roanoke, Blacksburg, Harrisonburg", tz: "Eastern" },
    { code: "541", state: "OR", name: "Oregon", city: "Eugene, Bend, Medford, Corvallis", tz: "Pacific" },
    { code: "551", state: "NJ", name: "New Jersey", city: "Jersey City, Union City, Bayonne", tz: "Eastern" },
    { code: "559", state: "CA", name: "California", city: "Fresno, Visalia, Clovis, Madera", tz: "Pacific" },
    { code: "561", state: "FL", name: "Florida", city: "West Palm Beach, Boca Raton, Boynton Beach", tz: "Eastern" },
    { code: "562", state: "CA", name: "California", city: "Long Beach, Downey, Norwalk, Whittier", tz: "Pacific" },
    { code: "563", state: "IA", name: "Iowa", city: "Davenport, Dubuque, Clinton, Bettendorf", tz: "Central" },
    { code: "567", state: "OH", name: "Ohio", city: "Toledo, Mansfield, Lima, Findlay", tz: "Eastern" },
    { code: "570", state: "PA", name: "Pennsylvania", city: "Scranton, Wilkes-Barre, Williamsport", tz: "Eastern" },
    { code: "571", state: "VA", name: "Virginia", city: "Arlington, Alexandria, Fairfax", tz: "Eastern" },
    { code: "573", state: "MO", name: "Missouri", city: "Columbia, Jefferson City, Cape Girardeau", tz: "Central" },
    { code: "574", state: "IN", name: "Indiana", city: "South Bend, Elkhart, Mishawaka", tz: "Eastern" },
    { code: "575", state: "NM", name: "New Mexico", city: "Las Cruces, Roswell, Hobbs", tz: "Mountain" },
    { code: "580", state: "OK", name: "Oklahoma", city: "Lawton, Enid, Ponca City, Ardmore", tz: "Central" },
    { code: "585", state: "NY", name: "New York", city: "Rochester, Batavia, Canandaigua", tz: "Eastern" },
    { code: "586", state: "MI", name: "Michigan", city: "Warren, Sterling Heights, Clinton Township", tz: "Eastern" },
    { code: "601", state: "MS", name: "Mississippi", city: "Jackson, Hattiesburg, Meridian", tz: "Central" },
    { code: "602", state: "AZ", name: "Arizona", city: "Phoenix (Central)", tz: "Mountain (No DST)" },
    { code: "603", state: "NH", name: "New Hampshire", city: "Manchester, Nashua, Concord, Entire State", tz: "Eastern" },
    { code: "605", state: "SD", name: "South Dakota", city: "Sioux Falls, Rapid City, Aberdeen, Entire State", tz: "Central / Mountain" },
    { code: "606", state: "KY", name: "Kentucky", city: "Ashland, Pikeville, Somerset, Hazard", tz: "Eastern" },
    { code: "607", state: "NY", name: "New York", city: "Binghamton, Ithaca, Elmira, Corning", tz: "Eastern" },
    { code: "608", state: "WI", name: "Wisconsin", city: "Madison, Janesville, La Crosse, Beloit", tz: "Central" },
    { code: "609", state: "NJ", name: "New Jersey", city: "Trenton, Atlantic City, Princeton", tz: "Eastern" },
    { code: "610", state: "PA", name: "Pennsylvania", city: "Allentown, Reading, Bethlehem, Norristown", tz: "Eastern" },
    { code: "612", state: "MN", name: "Minnesota", city: "Minneapolis, Richfield, St. Anthony", tz: "Central" },
    { code: "614", state: "OH", name: "Ohio", city: "Columbus, Dublin, Westerville, Grove City", tz: "Eastern" },
    { code: "615", state: "TN", name: "Tennessee", city: "Nashville, Murfreesboro, Franklin, Hendersonville", tz: "Central" },
    { code: "616", state: "MI", name: "Michigan", city: "Grand Rapids, Wyoming, Holland", tz: "Eastern" },
    { code: "617", state: "MA", name: "Massachusetts", city: "Boston, Cambridge, Quincy, Newton", tz: "Eastern" },
    { code: "618", state: "IL", name: "Illinois", city: "Belleville, Carbondale, Alton, Granite City", tz: "Central" },
    { code: "619", state: "CA", name: "California", city: "San Diego (Downtown, South & East)", tz: "Pacific" },
    { code: "620", state: "KS", name: "Kansas", city: "Hutchinson, Salina, Dodge City, Garden City", tz: "Central" },
    { code: "623", state: "AZ", name: "Arizona", city: "Glendale, Peoria, Sun City, Buckeye", tz: "Mountain (No DST)" },
    { code: "626", state: "CA", name: "California", city: "Pasadena, El Monte, West Covina, Alhambra", tz: "Pacific" },
    { code: "628", state: "CA", name: "California", city: "San Francisco (Overlay)", tz: "Pacific" },
    { code: "629", state: "TN", name: "Tennessee", city: "Nashville (Overlay)", tz: "Central" },
    { code: "630", state: "IL", name: "Illinois", city: "Naperville, Aurora, Wheaton, Downers Grove", tz: "Central" },
    { code: "631", state: "NY", name: "New York", city: "Long Island (Suffolk County)", tz: "Eastern" },
    { code: "636", state: "MO", name: "Missouri", city: "St. Charles, Chesterfield, O'Fallon", tz: "Central" },
    { code: "641", state: "IA", name: "Iowa", city: "Mason City, Ottumwa, Marshalltown", tz: "Central" },
    { code: "646", state: "NY", name: "New York", city: "New York City (Manhattan overlay)", tz: "Eastern" },
    { code: "650", state: "CA", name: "California", city: "San Mateo, Palo Alto, Redwood City", tz: "Pacific" },
    { code: "651", state: "MN", name: "Minnesota", city: "St. Paul, Woodbury, Maplewood", tz: "Central" },
    { code: "657", state: "CA", name: "California", city: "Anaheim, Huntington Beach, Fullerton", tz: "Pacific" },
    { code: "661", state: "CA", name: "California", city: "Bakersfield, Palmdale, Lancaster, Santa Clarita", tz: "Pacific" },
    { code: "662", state: "MS", name: "Mississippi", city: "Tupelo, Southaven, Greenville, Oxford", tz: "Central" },
    { code: "667", state: "MD", name: "Maryland", city: "Baltimore, Annapolis, Salisbury", tz: "Eastern" },
    { code: "669", state: "CA", name: "California", city: "San Jose, Sunnyvale, Santa Clara", tz: "Pacific" },
    { code: "678", state: "GA", name: "Georgia", city: "Atlanta, Marietta, Alpharetta, Duluth", tz: "Eastern" },
    { code: "682", state: "TX", name: "Texas", city: "Fort Worth, Arlington, Grand Prairie", tz: "Central" },
    { code: "702", state: "NV", name: "Nevada", city: "Las Vegas, Henderson, North Las Vegas", tz: "Pacific" },
    { code: "703", state: "VA", name: "Virginia", city: "Arlington, Alexandria, Fairfax, Reston", tz: "Eastern" },
    { code: "704", state: "NC", name: "North Carolina", city: "Charlotte, Concord, Gastonia, Salisbury", tz: "Eastern" },
    { code: "706", state: "GA", name: "Georgia", city: "Augusta, Columbus, Athens, Rome", tz: "Eastern" },
    { code: "707", state: "CA", name: "California", city: "Santa Rosa, Vallejo, Napa, Eureka", tz: "Pacific" },
    { code: "708", state: "IL", name: "Illinois", city: "Cicero, Oak Lawn, Orland Park, Berwyn", tz: "Central" },
    { code: "712", state: "IA", name: "Iowa", city: "Sioux City, Council Bluffs, Spencer", tz: "Central" },
    { code: "713", state: "TX", name: "Texas", city: "Houston (Central)", tz: "Central" },
    { code: "714", state: "CA", name: "California", city: "Anaheim, Santa Ana, Orange, Garden Grove", tz: "Pacific" },
    { code: "715", state: "WI", name: "Wisconsin", city: "Eau Claire, Wausau, Superior, Stevens Point", tz: "Central" },
    { code: "716", state: "NY", name: "New York", city: "Buffalo, Niagara Falls, Cheektowaga", tz: "Eastern" },
    { code: "717", state: "PA", name: "Pennsylvania", city: "Harrisburg, Lancaster, York, Lebanon", tz: "Eastern" },
    { code: "718", state: "NY", name: "New York", city: "New York City (Brooklyn, Queens, Bronx, SI)", tz: "Eastern" },
    { code: "719", state: "CO", name: "Colorado", city: "Colorado Springs, Pueblo, Canon City", tz: "Mountain" },
    { code: "720", state: "CO", name: "Colorado", city: "Denver, Aurora, Lakewood, Boulder", tz: "Mountain" },
    { code: "724", state: "PA", name: "Pennsylvania", city: "New Castle, Greensburg, Washington", tz: "Eastern" },
    { code: "727", state: "FL", name: "Florida", city: "St. Petersburg, Clearwater, Largo", tz: "Eastern" },
    { code: "732", state: "NJ", name: "New Jersey", city: "Toms River, New Brunswick, Woodbridge", tz: "Eastern" },
    { code: "734", state: "MI", name: "Michigan", city: "Ann Arbor, Livonia, Canton, Westland", tz: "Eastern" },
    { code: "740", state: "OH", name: "Ohio", city: "Newark, Zanesville, Lancaster, Marion", tz: "Eastern" },
    { code: "754", state: "FL", name: "Florida", city: "Fort Lauderdale, Hollywood, Pembroke Pines", tz: "Eastern" },
    { code: "757", state: "VA", name: "Virginia", city: "Virginia Beach, Norfolk, Chesapeake, Newport News", tz: "Eastern" },
    { code: "760", state: "CA", name: "California", city: "Palm Springs, Oceanside, Victorville, Vista", tz: "Pacific" },
    { code: "763", state: "MN", name: "Minnesota", city: "Brooklyn Park, Plymouth, Maple Grove, Coon Rapids", tz: "Central" },
    { code: "765", state: "IN", name: "Indiana", city: "Lafayette, Muncie, Anderson, Kokomo", tz: "Eastern" },
    { code: "770", state: "GA", name: "Georgia", city: "Roswell, Johns Creek, Alpharetta, Marietta", tz: "Eastern" },
    { code: "772", state: "FL", name: "Florida", city: "Port St. Lucie, Fort Pierce, Stuart, Vero Beach", tz: "Eastern" },
    { code: "773", state: "IL", name: "Illinois", city: "Chicago (Neighborhoods outside The Loop)", tz: "Central" },
    { code: "774", state: "MA", name: "Massachusetts", city: "Worcester, New Bedford, Brockton, Plymouth", tz: "Eastern" },
    { code: "775", state: "NV", name: "Nevada", city: "Reno, Sparks, Carson City, Elko", tz: "Pacific" },
    { code: "779", state: "IL", name: "Illinois", city: "Rockford, Joliet, DeKalb, Kankakee", tz: "Central" },
    { code: "781", state: "MA", name: "Massachusetts", city: "Lynn, Waltham, Malden, Medford, Weymouth", tz: "Eastern" },
    { code: "785", state: "KS", name: "Kansas", city: "Topeka, Lawrence, Manhattan, Salina", tz: "Central" },
    { code: "786", state: "FL", name: "Florida", city: "Miami, Hialeah, Coral Gables, Key West", tz: "Eastern" },
    { code: "801", state: "UT", name: "Utah", city: "Salt Lake City, West Valley City, Provo, West Jordan", tz: "Mountain" },
    { code: "802", state: "VT", name: "Vermont", city: "Burlington, Montpelier, Rutland, Entire State", tz: "Eastern" },
    { code: "803", state: "SC", name: "South Carolina", city: "Columbia, Rock Hill, Sumter, Aiken", tz: "Eastern" },
    { code: "804", state: "VA", name: "Virginia", city: "Richmond, Petersburg, Hopewell, Mechanicsville", tz: "Eastern" },
    { code: "805", state: "CA", name: "California", city: "Oxnard, Thousand Oaks, Simi Valley, Santa Barbara", tz: "Pacific" },
    { code: "806", state: "TX", name: "Texas", city: "Lubbock, Amarillo, Plainview", tz: "Central" },
    { code: "808", state: "HI", name: "Hawaii", city: "Honolulu, Hilo, Kailua, Entire State", tz: "Hawaii (HST)" },
    { code: "812", state: "IN", name: "Indiana", city: "Evansville, Bloomington, Terre Haute, Columbus", tz: "Eastern / Central" },
    { code: "813", state: "FL", name: "Florida", city: "Tampa, Brandon, Riverview, Town 'n' Country", tz: "Eastern" },
    { code: "814", state: "PA", name: "Pennsylvania", city: "Erie, State College, Altoona, Johnstown", tz: "Eastern" },
    { code: "815", state: "IL", name: "Illinois", city: "Rockford, Joliet, DeKalb, Crystal Lake", tz: "Central" },
    { code: "816", state: "MO", name: "Missouri", city: "Kansas City, Independence, Lee's Summit, St. Joseph", tz: "Central" },
    { code: "817", state: "TX", name: "Texas", city: "Fort Worth, Arlington, North Richland Hills", tz: "Central" },
    { code: "818", state: "CA", name: "California", city: "Glendale, Burbank, San Fernando Valley", tz: "Pacific" },
    { code: "828", state: "NC", name: "North Carolina", city: "Asheville, Hickory, Lenoir, Morganton", tz: "Eastern" },
    { code: "830", state: "TX", name: "Texas", city: "New Braunfels, Del Rio, Kerrville, Seguin", tz: "Central" },
    { code: "831", state: "CA", name: "California", city: "Salinas, Monterey, Santa Cruz, Seaside", tz: "Pacific" },
    { code: "832", state: "TX", name: "Texas", city: "Houston, Pasadena, Baytown, Sugar Land", tz: "Central" },
    { code: "843", state: "SC", name: "South Carolina", city: "Charleston, Myrtle Beach, Mount Pleasant, Florence", tz: "Eastern" },
    { code: "845", state: "NY", name: "New York", city: "Poughkeepsie, Newburgh, Middletown, Kingston", tz: "Eastern" },
    { code: "847", state: "IL", name: "Illinois", city: "Elgin, Waukegan, Arlington Heights, Evanston", tz: "Central" },
    { code: "848", state: "NJ", name: "New Jersey", city: "Toms River, New Brunswick, Perth Amboy", tz: "Eastern" },
    { code: "850", state: "FL", name: "Florida", city: "Tallahassee, Pensacola, Panama City", tz: "Eastern / Central" },
    { code: "856", state: "NJ", name: "New Jersey", city: "Camden, Cherry Hill, Vineland", tz: "Eastern" },
    { code: "857", state: "MA", name: "Massachusetts", city: "Boston, Cambridge, Quincy, Newton", tz: "Eastern" },
    { code: "858", state: "CA", name: "California", city: "San Diego (La Jolla, Del Mar, Poway)", tz: "Pacific" },
    { code: "859", state: "KY", name: "Kentucky", city: "Lexington, Covington, Richmond, Florence", tz: "Eastern" },
    { code: "860", state: "CT", name: "Connecticut", city: "Hartford, New Britain, Bristol, Norwich", tz: "Eastern" },
    { code: "862", state: "NJ", name: "New Jersey", city: "Newark, Paterson, Clifton, Passaic", tz: "Eastern" },
    { code: "863", state: "FL", name: "Florida", city: "Lakeland, Winter Haven, Sebring", tz: "Eastern" },
    { code: "864", state: "SC", name: "South Carolina", city: "Greenville, Spartanburg, Anderson, Greer", tz: "Eastern" },
    { code: "865", state: "TN", name: "Tennessee", city: "Knoxville, Maryville, Oak Ridge", tz: "Eastern" },
    { code: "870", state: "AR", name: "Arkansas", city: "Jonesboro, Pine Bluff, Texarkana, West Memphis", tz: "Central" },
    { code: "901", state: "TN", name: "Tennessee", city: "Memphis, Bartlett, Collierville, Germantown", tz: "Central" },
    { code: "903", state: "TX", name: "Texas", city: "Tyler, Longview, Sherman, Texarkana", tz: "Central" },
    { code: "904", state: "FL", name: "Florida", city: "Jacksonville, St. Augustine, Orange Park", tz: "Eastern" },
    { code: "906", state: "MI", name: "Michigan", city: "Marquette, Sault Ste. Marie, Upper Peninsula", tz: "Eastern / Central" },
    { code: "907", state: "AK", name: "Alaska", city: "Anchorage, Fairbanks, Juneau, Entire State", tz: "Alaska (AKST)" },
    { code: "908", state: "NJ", name: "New Jersey", city: "Elizabeth, Plainfield, Linden, Westfield", tz: "Eastern" },
    { code: "909", state: "CA", name: "California", city: "San Bernardino, Fontana, Ontario, Rancho Cucamonga", tz: "Pacific" },
    { code: "910", state: "NC", name: "North Carolina", city: "Fayetteville, Wilmington, Jacksonville", tz: "Eastern" },
    { code: "912", state: "GA", name: "Georgia", city: "Savannah, Hinesville, Statesboro, Brunswick", tz: "Eastern" },
    { code: "913", state: "KS", name: "Kansas", city: "Overland Park, Kansas City, Olathe, Shawnee", tz: "Central" },
    { code: "914", state: "NY", name: "New York", city: "Westchester County (Yonkers, New Rochelle, White Plains)", tz: "Eastern" },
    { code: "915", state: "TX", name: "Texas", city: "El Paso, Socorro", tz: "Mountain" },
    { code: "916", state: "CA", name: "California", city: "Sacramento, Elk Grove, Roseville, Folsom", tz: "Pacific" },
    { code: "917", state: "NY", name: "New York", city: "New York City (Mobile/Overlay all 5 boroughs)", tz: "Eastern" },
    { code: "918", state: "OK", name: "Oklahoma", city: "Tulsa, Broken Arrow, Muskogee, Bartlesville", tz: "Central" },
    { code: "919", state: "NC", name: "North Carolina", city: "Raleigh, Durham, Cary, Chapel Hill (Research Triangle)", tz: "Eastern" },
    { code: "920", state: "WI", name: "Wisconsin", city: "Green Bay, Appleton, Oshkosh, Sheboygan", tz: "Central" },
    { code: "925", state: "CA", name: "California", city: "Concord, Walnut Creek, Antioch, San Ramon", tz: "Pacific" },
    { code: "928", state: "AZ", name: "Arizona", city: "Yuma, Flagstaff, Lake Havasu City, Prescott", tz: "Mountain (No DST)" },
    { code: "929", state: "NY", name: "New York", city: "New York City (Brooklyn, Queens, Bronx, SI)", tz: "Eastern" },
    { code: "931", state: "TN", name: "Tennessee", city: "Clarksville, Cookeville, Columbia, Tullahoma", tz: "Central" },
    { code: "936", state: "TX", name: "Texas", city: "Conroe, Nacogdoches, Huntsville, Lufkin", tz: "Central" },
    { code: "937", state: "OH", name: "Ohio", city: "Dayton, Springfield, Kettering, Beavercreek", tz: "Eastern" },
    { code: "940", state: "TX", name: "Texas", city: "Denton, Wichita Falls, Lewisville", tz: "Central" },
    { code: "941", state: "FL", name: "Florida", city: "Sarasota, Bradenton, Venice, North Port", tz: "Eastern" },
    { code: "949", state: "CA", name: "California", city: "Irvine, Newport Beach, Mission Viejo, Laguna Niguel", tz: "Pacific" },
    { code: "951", state: "CA", name: "California", city: "Riverside, Moreno Valley, Corona, Temecula", tz: "Pacific" },
    { code: "952", state: "MN", name: "Minnesota", city: "Bloomington, Eden Prairie, Minnetonka, Edina", tz: "Central" },
    { code: "954", state: "FL", name: "Florida", city: "Fort Lauderdale, Hollywood, Pembroke Pines, Coral Springs", tz: "Eastern" },
    { code: "956", state: "TX", name: "Texas", city: "Laredo, Brownsville, McAllen, Edinburg", tz: "Central" },
    { code: "970", state: "CO", name: "Colorado", city: "Fort Collins, Greeley, Loveland, Grand Junction, Aspen", tz: "Mountain" },
    { code: "971", state: "OR", name: "Oregon", city: "Portland, Salem, Gresham, Beaverton", tz: "Pacific" },
    { code: "972", state: "TX", name: "Texas", city: "Dallas, Plano, Irving, Garland, Richardson", tz: "Central" },
    { code: "973", state: "NJ", name: "New Jersey", city: "Newark, Paterson, Clifton, Passaic", tz: "Eastern" },
    { code: "978", state: "MA", name: "Massachusetts", city: "Lowell, Lawrence, Haverhill, Peabody", tz: "Eastern" },
    { code: "979", state: "TX", name: "Texas", city: "College Station, Bryan, Lake Jackson", tz: "Central" },
    { code: "980", state: "NC", name: "North Carolina", city: "Charlotte, Concord, Gastonia, Huntersville", tz: "Eastern" },
    { code: "984", state: "NC", name: "North Carolina", city: "Raleigh, Durham, Cary, Chapel Hill", tz: "Eastern" },
    { code: "985", state: "LA", name: "Louisiana", city: "Houma, Slidell, Hammond, Thibodaux", tz: "Central" },
    { code: "989", state: "MI", name: "Michigan", city: "Saginaw, Midland, Bay City, Mount Pleasant", tz: "Eastern" }
  ];

  // US State 2-Digit ZIP Code Prefix Ranges (USPS Standard)
  const ZIP_PREFIX_MAP = [
    { prefixMin: 10, prefixMax: 27, state: "MA", name: "Massachusetts", capital: "Boston", tz: "Eastern" },
    { prefixMin: 28, prefixMax: 29, state: "RI", name: "Rhode Island", capital: "Providence", tz: "Eastern" },
    { prefixMin: 30, prefixMax: 38, state: "NH", name: "New Hampshire", capital: "Concord", tz: "Eastern" },
    { prefixMin: 39, prefixMax: 49, state: "ME", name: "Maine", capital: "Augusta", tz: "Eastern" },
    { prefixMin: 50, prefixMax: 59, state: "VT", name: "Vermont", capital: "Montpelier", tz: "Eastern" },
    { prefixMin: 60, prefixMax: 69, state: "CT", name: "Connecticut", capital: "Hartford", tz: "Eastern" },
    { prefixMin: 70, prefixMax: 89, state: "NJ", name: "New Jersey", capital: "Trenton", tz: "Eastern" },
    { prefixMin: 90, prefixMax: 99, state: "APO/FPO", name: "Armed Forces Americas / Europe", capital: "Military", tz: "Various" },
    { prefixMin: 100, prefixMax: 149, state: "NY", name: "New York", capital: "Albany", tz: "Eastern" },
    { prefixMin: 150, prefixMax: 196, state: "PA", name: "Pennsylvania", capital: "Harrisburg", tz: "Eastern" },
    { prefixMin: 197, prefixMax: 199, state: "DE", name: "Delaware", capital: "Dover", tz: "Eastern" },
    { prefixMin: 200, prefixMax: 205, state: "DC", name: "District of Columbia", capital: "Washington", tz: "Eastern" },
    { prefixMin: 206, prefixMax: 219, state: "MD", name: "Maryland", capital: "Annapolis", tz: "Eastern" },
    { prefixMin: 220, prefixMax: 246, state: "VA", name: "Virginia", capital: "Richmond", tz: "Eastern" },
    { prefixMin: 247, prefixMax: 268, state: "WV", name: "West Virginia", capital: "Charleston", tz: "Eastern" },
    { prefixMin: 270, prefixMax: 289, state: "NC", name: "North Carolina", capital: "Raleigh", tz: "Eastern" },
    { prefixMin: 290, prefixMax: 299, state: "SC", name: "South Carolina", capital: "Columbia", tz: "Eastern" },
    { prefixMin: 300, prefixMax: 319, state: "GA", name: "Georgia", capital: "Atlanta", tz: "Eastern" },
    { prefixMin: 320, prefixMax: 349, state: "FL", name: "Florida", capital: "Tallahassee", tz: "Eastern" },
    { prefixMin: 350, prefixMax: 369, state: "AL", name: "Alabama", capital: "Montgomery", tz: "Central" },
    { prefixMin: 370, prefixMax: 385, state: "TN", name: "Tennessee", capital: "Nashville", tz: "Central / Eastern" },
    { prefixMin: 386, prefixMax: 397, state: "MS", name: "Mississippi", capital: "Jackson", tz: "Central" },
    { prefixMin: 400, prefixMax: 427, state: "KY", name: "Kentucky", capital: "Frankfort", tz: "Eastern / Central" },
    { prefixMin: 430, prefixMax: 459, state: "OH", name: "Ohio", capital: "Columbus", tz: "Eastern" },
    { prefixMin: 460, prefixMax: 479, state: "IN", name: "Indiana", capital: "Indianapolis", tz: "Eastern / Central" },
    { prefixMin: 480, prefixMax: 499, state: "MI", name: "Michigan", capital: "Lansing", tz: "Eastern / Central" },
    { prefixMin: 500, prefixMax: 528, state: "IA", name: "Iowa", capital: "Des Moines", tz: "Central" },
    { prefixMin: 530, prefixMax: 549, state: "WI", name: "Wisconsin", capital: "Madison", tz: "Central" },
    { prefixMin: 550, prefixMax: 567, state: "MN", name: "Minnesota", capital: "St. Paul", tz: "Central" },
    { prefixMin: 570, prefixMax: 577, state: "SD", name: "South Dakota", capital: "Pierre", tz: "Central / Mountain" },
    { prefixMin: 580, prefixMax: 588, state: "ND", name: "North Dakota", capital: "Bismarck", tz: "Central / Mountain" },
    { prefixMin: 590, prefixMax: 599, state: "MT", name: "Montana", capital: "Helena", tz: "Mountain" },
    { prefixMin: 600, prefixMax: 629, state: "IL", name: "Illinois", capital: "Springfield", tz: "Central" },
    { prefixMin: 630, prefixMax: 658, state: "MO", name: "Missouri", capital: "Jefferson City", tz: "Central" },
    { prefixMin: 660, prefixMax: 679, state: "KS", name: "Kansas", capital: "Topeka", tz: "Central / Mountain" },
    { prefixMin: 680, prefixMax: 693, state: "NE", name: "Nebraska", capital: "Lincoln", tz: "Central / Mountain" },
    { prefixMin: 700, prefixMax: 714, state: "LA", name: "Louisiana", capital: "Baton Rouge", tz: "Central" },
    { prefixMin: 716, prefixMax: 729, state: "AR", name: "Arkansas", capital: "Little Rock", tz: "Central" },
    { prefixMin: 730, prefixMax: 749, state: "OK", name: "Oklahoma", capital: "Oklahoma City", tz: "Central" },
    { prefixMin: 750, prefixMax: 799, state: "TX", name: "Texas", capital: "Austin", tz: "Central / Mountain" },
    { prefixMin: 800, prefixMax: 816, state: "CO", name: "Colorado", capital: "Denver", tz: "Mountain" },
    { prefixMin: 820, prefixMax: 831, state: "WY", name: "Wyoming", capital: "Cheyenne", tz: "Mountain" },
    { prefixMin: 832, prefixMax: 838, state: "ID", name: "Idaho", capital: "Boise", tz: "Mountain / Pacific" },
    { prefixMin: 840, prefixMax: 847, state: "UT", name: "Utah", capital: "Salt Lake City", tz: "Mountain" },
    { prefixMin: 850, prefixMax: 865, state: "AZ", name: "Arizona", capital: "Phoenix", tz: "Mountain" },
    { prefixMin: 870, prefixMax: 884, state: "NM", name: "New Mexico", capital: "Santa Fe", tz: "Mountain" },
    { prefixMin: 889, prefixMax: 898, state: "NV", name: "Nevada", capital: "Carson City", tz: "Pacific / Mountain" },
    { prefixMin: 900, prefixMax: 961, state: "CA", name: "California", capital: "Sacramento", tz: "Pacific" },
    { prefixMin: 967, prefixMax: 968, state: "HI", name: "Hawaii", capital: "Honolulu", tz: "Hawaii (HST)" },
    { prefixMin: 970, prefixMax: 979, state: "OR", name: "Oregon", capital: "Salem", tz: "Pacific / Mountain" },
    { prefixMin: 980, prefixMax: 994, state: "WA", name: "Washington", capital: "Olympia", tz: "Pacific" },
    { prefixMin: 995, prefixMax: 999, state: "AK", name: "Alaska", capital: "Juneau", tz: "Alaska (AKST)" }
  ];

  // DOM Elements
  const areaCodeInput = document.getElementById('area-code-input');
  const areaCodeResults = document.getElementById('area-code-results');
  const zipCodeInput = document.getElementById('zip-code-input');
  const zipResultCard = document.getElementById('zip-result-card');
  const stateSearchInput = document.getElementById('state-search-input');
  const statesGrid = document.getElementById('states-grid');
  const tabButtons = document.querySelectorAll('.lookup-tab-btn');
  const tabPanels = document.querySelectorAll('.lookup-tab-panel');

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        b.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');

      const target = btn.dataset.tab;
      tabPanels.forEach(p => {
        if (p.id === target) p.classList.remove('hidden');
        else p.classList.add('hidden');
      });
    });
  });

  // Area Code Lookup
  function searchAreaCode() {
    const query = areaCodeInput?.value.trim().toLowerCase() || '';
    if (!areaCodeResults) return;

    if (!query) {
      renderAreaCodes(AREA_CODES.slice(0, 12));
      return;
    }

    const matches = AREA_CODES.filter(item =>
      item.code.includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.city.toLowerCase().includes(query) ||
      item.state.toLowerCase() === query
    );

    renderAreaCodes(matches);
  }

  function renderAreaCodes(list) {
    if (!areaCodeResults) return;
    if (list.length === 0) {
      areaCodeResults.innerHTML = `
        <div class="col-span-full p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <p class="text-sm text-slate-500 dark:text-slate-400">No matching US area code found. Enter a 3-digit code (e.g. 212, 310, 415) or state name.</p>
        </div>
      `;
      return;
    }

    areaCodeResults.innerHTML = list.map(item => `
      <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 card-hover flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">(${item.code})</span>
          <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">${item.state}</span>
        </div>
        <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-1">${item.name}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">${item.city}</p>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>🕒 ${item.tz} Time</span>
          <button type="button" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold" onclick="navigator.clipboard.writeText('${item.code} - ${item.city}, ${item.state}'); window.showToast && window.showToast('Copied info!');">Copy</button>
        </div>
      </div>
    `).join('');
  }

  if (areaCodeInput) {
    areaCodeInput.addEventListener('input', searchAreaCode);
  }

  // ZIP Code Validator & Lookup
  function checkZipCode() {
    if (!zipCodeInput || !zipResultCard) return;
    const raw = zipCodeInput.value.replace(/\D/g, '');

    if (raw.length < 5) {
      zipResultCard.innerHTML = `
        <div class="p-6 text-center text-slate-400 dark:text-slate-500">
          <p class="text-sm">Type a 5-digit US ZIP Code above (e.g. 90210, 10001, 75001) to decode location & time zone.</p>
        </div>
      `;
      return;
    }

    const fiveDigit = raw.substring(0, 5);
    const prefix2 = parseInt(fiveDigit.substring(0, 2), 10);
    const prefix3 = parseInt(fiveDigit.substring(0, 3), 10);

    // Find state range
    const stateMatch = ZIP_PREFIX_MAP.find(m =>
      (fiveDigit.length === 5 && prefix3 >= m.prefixMin && prefix3 <= m.prefixMax) ||
      (prefix2 >= m.prefixMin && prefix2 <= m.prefixMax)
    );

    if (stateMatch) {
      zipResultCard.innerHTML = `
        <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                <i data-lucide="map-pin" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Valid US Postal ZIP Code</span>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${fiveDigit}</h3>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              ✓ USPS Formatted
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span class="text-slate-400 block mb-0.5">State</span>
              <span class="font-bold text-slate-900 dark:text-white text-sm">${stateMatch.name} (${stateMatch.state})</span>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span class="text-slate-400 block mb-0.5">Primary Time Zone</span>
              <span class="font-bold text-slate-900 dark:text-white text-sm">${stateMatch.tz}</span>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span class="text-slate-400 block mb-0.5">State Capital</span>
              <span class="font-bold text-slate-900 dark:text-white text-sm">${stateMatch.capital}</span>
            </div>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            ZIP code <strong>${fiveDigit}</strong> falls within the authorized USPS postal delivery routing network for <strong>${stateMatch.name}</strong>. Delivery trucks and automated mail sorting bars utilize this prefix to dispatch parcels within standard USPS transit windows.
          </p>

          <button type="button" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5" onclick="navigator.clipboard.writeText('${fiveDigit}, ${stateMatch.name}, USA'); window.showToast && window.showToast('Copied address string!');">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Formatted ZIP
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    } else {
      zipResultCard.innerHTML = `
        <div class="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-center">
          <p class="text-sm font-bold text-amber-800 dark:text-amber-300">ZIP Code ${fiveDigit} is unrecognized or outside standard 50-state ranges.</p>
          <p class="text-xs text-amber-700 dark:text-amber-400 mt-1">Please verify that you typed a valid 5-digit US postal code.</p>
        </div>
      `;
    }
  }

  if (zipCodeInput) {
    zipCodeInput.addEventListener('input', checkZipCode);
  }

  // Populate States directory
  function renderStatesDirectory() {
    if (!statesGrid) return;
    const query = stateSearchInput?.value.trim().toLowerCase() || '';

    const filtered = ZIP_PREFIX_MAP.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.state.toLowerCase() === query ||
      s.capital.toLowerCase().includes(query)
    );

    statesGrid.innerHTML = filtered.map(s => {
      // Find area codes for this state
      const matchingCodes = AREA_CODES.filter(a => a.state === s.state).map(a => a.code);
      const codeListStr = matchingCodes.length > 0 ? matchingCodes.slice(0, 6).join(', ') + (matchingCodes.length > 6 ? '...' : '') : 'Statewide';

      return `
        <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-1.5">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${s.name}</h4>
            <span class="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${s.state}</span>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-2">
            <div><strong class="text-slate-700 dark:text-slate-300">Capital:</strong> ${s.capital}</div>
            <div><strong class="text-slate-700 dark:text-slate-300">Time:</strong> ${s.tz}</div>
            <div><strong class="text-slate-700 dark:text-slate-300">Area Codes:</strong> ${codeListStr}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (stateSearchInput) {
    stateSearchInput.addEventListener('input', renderStatesDirectory);
  }

  // Initialize
  searchAreaCode();
  renderStatesDirectory();
});
