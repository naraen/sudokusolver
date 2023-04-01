(function () {
  var tests = [
    {
      desc: "1. Difficult - 5 of 5",
      input: `
100005030
405080000
087300000
903020000
840030057
000040301
000008920
000060108
090200003
`,
      expected: `
|1|6|9|4|7|5|8|3|2
|4|3|5|1|8|2|7|6|9
|2|8|7|3|9|6|4|1|5
|9|7|3|5|2|1|6|8|4
|8|4|1|6|3|9|2|5|7
|5|2|6|8|4|7|3|9|1
|3|1|4|7|5|8|9|2|6
|7|5|2|9|6|3|1|4|8
|6|9|8|2|1|4|5|7|3`,
    },
    {
      desc: "2. Medium - 4 of 5",
      input: `
208005040
050740008
000810600
003000097
000000000
790000400
007038000
400091050
030500806
			`,
      expected: `
|2|7|8|3|6|5|1|4|9
|1|5|6|7|4|9|2|3|8
|3|4|9|8|1|2|6|7|5
|8|1|3|4|2|6|5|9|7
|6|2|4|9|5|7|3|8|1
|7|9|5|1|8|3|4|6|2
|5|6|7|2|3|8|9|1|4
|4|8|2|6|9|1|7|5|3
|9|3|1|5|7|4|8|2|6`,
    },
    {
      desc: "3. Grid - Difficult1",
      input: `
000000000
080090200
060001007
090060001
000050003
650020070
305000000
070004008
008009030
			`,
      hints: [
        [0, "4"],
        [2, "9"],
      ],
      expected: `
|4|3|9|6|7|2|8|1|5
|7|8|1|3|9|5|2|6|4
|5|6|2|8|4|1|3|9|7
|8|9|7|4|6|3|5|2|1
|1|2|4|9|5|7|6|8|3
|6|5|3|1|2|8|4|7|9
|3|1|5|7|8|6|9|4|2
|9|7|6|2|3|4|1|5|8
|2|4|8|5|1|9|7|3|6`,
    },
    {
      desc: "4. Grid1 - Easy",
      input: `
	064093710
270800096   
001675000
000050820
700030009
049080000
000528100
150009074
026410950
`,
      expected: `
|8|6|4|2|9|3|7|1|5
|2|7|5|8|4|1|3|9|6
|9|3|1|6|7|5|4|8|2
|6|1|3|9|5|4|8|2|7
|7|8|2|1|3|6|5|4|9
|5|4|9|7|8|2|6|3|1
|4|9|7|5|2|8|1|6|3
|1|5|8|3|6|9|2|7|4
|3|2|6|4|1|7|9|5|8`,
    },
    {
      desc: "5. Grid 2 - Difficulty Two of Five",
      input: `200680000
006020015
004579600
090038050
430916087
080050060
008263500
920040800
000097002`,
      hints: [],
      expected: `
|2|5|9|6|8|1|7|4|3
|8|7|6|3|2|4|9|1|5
|3|1|4|5|7|9|6|2|8
|6|9|2|7|3|8|1|5|4
|4|3|5|9|1|6|2|8|7
|1|8|7|4|5|2|3|6|9
|7|4|8|2|6|3|5|9|1
|9|2|3|1|4|5|8|7|6
|5|6|1|8|9|7|4|3|2`,
    },
    {
      desc: "6. Grid 3 - Difficulty 3 of 5",
      input: `
042060000
000489020
800020700
100000300
250070041
008000002
007090003
080216000
000040910
`,
      hints: [],
      expected: `
|9|4|2|7|6|1|8|3|5
|7|3|5|4|8|9|1|2|6
|8|6|1|5|2|3|7|9|4
|1|7|4|6|5|2|3|8|9
|2|5|3|9|7|8|6|4|1
|6|9|8|1|3|4|5|7|2
|4|1|7|8|9|5|2|6|3
|3|8|9|2|1|6|4|5|7
|5|2|6|3|4|7|9|1|8`,
    },
  ];

  module.exports = tests;
})();
